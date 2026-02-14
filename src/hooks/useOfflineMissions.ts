import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  getCachedReports,
  getCachedReport,
  cacheReport,
  cachePhotoBlob,
  addToSyncQueue,
  type OfflineReport,
} from "@/lib/offline-store";
import { queueMissionStart, queueMissionComplete, queuePhotoUpload } from "@/lib/sync-manager";
import type { Report, Photo } from "@/types/report";

/**
 * Mission keys for React Query
 */
export const missionKeys = {
  all: ["missions"] as const,
  lists: () => [...missionKeys.all, "list"] as const,
  list: (filters: string) => [...missionKeys.lists(), { filters }] as const,
  details: () => [...missionKeys.all, "detail"] as const,
  detail: (id: string) => [...missionKeys.details(), id] as const,
};

/**
 * Offline-first missions hook
 * Reads from IndexedDB first, then fetches from server when online
 */
export function useOfflineMissions() {
  const [cachedData, setCachedData] = useState<OfflineReport[]>([]);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Load cached data immediately
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cached = await getCachedReports();
        setCachedData(cached);
      } catch (error) {
        // Silently fail and use empty array
        setCachedData([]);
      } finally {
        setIsLoadingCache(false);
      }
    };

    loadCachedData();
  }, []);

  // Server query (runs in background when online)
  const serverQuery = useQuery({
    queryKey: missionKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<{ missions: Report[] }>("/missions");

      // Cache the fetched data
      if (response.missions) {
        for (const mission of response.missions) {
          await cacheReport(mission, mission.photos);
        }
        // Update cached data state
        const freshCached = await getCachedReports();
        setCachedData(freshCached);
      }

      return response.missions;
    },
    enabled: typeof navigator !== "undefined" ? navigator.onLine : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if offline
  });

  return {
    missions: cachedData, // Always return cached data first
    isLoading: isLoadingCache, // Only show loading for cache, not server
    isRefreshing: serverQuery.isFetching, // Show refresh indicator for server sync
    error: serverQuery.error,
    refetch: serverQuery.refetch,
  };
}

/**
 * Offline-first single mission hook
 */
export function useOfflineMission(missionId: string) {
  const [cachedMission, setCachedMission] = useState<OfflineReport | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);

  // Load cached data immediately
  useEffect(() => {
    const loadCachedMission = async () => {
      try {
        const cached = await getCachedReport(missionId);
        setCachedMission(cached);
      } catch (error) {
        setCachedMission(null);
      } finally {
        setIsLoadingCache(false);
      }
    };

    if (missionId) {
      loadCachedMission();
    }
  }, [missionId]);

  // Server query
  const serverQuery = useQuery({
    queryKey: missionKeys.detail(missionId),
    queryFn: async () => {
      const mission = await apiClient.get<Report>(`/missions/${missionId}`);

      // Cache the fetched data
      await cacheReport(mission, mission.photos);

      // Update cached state
      const freshCached = await getCachedReport(missionId);
      setCachedMission(freshCached);

      return mission;
    },
    enabled: !!(missionId && typeof navigator !== "undefined" && navigator.onLine),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
  });

  return {
    mission: cachedMission,
    isLoading: isLoadingCache,
    isRefreshing: serverQuery.isFetching,
    error: serverQuery.error,
    refetch: serverQuery.refetch,
  };
}

/**
 * Start mission mutation (offline-capable)
 */
export function useStartMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId }: { missionId: string }) => {
      if (navigator.onLine) {
        // Online: send immediately
        const response = await apiClient.post<{ mission: Report }>(`/missions/${missionId}/start`);

        // Cache the response
        await cacheReport(response.mission);

        return response.mission;
      } else {
        // Offline: update local state and queue for sync
        const cachedMission = await getCachedReport(missionId);
        if (!cachedMission) throw new Error("Mission not found in cache");

        // Update local mission status
        const updatedMission: OfflineReport = {
          ...cachedMission,
          status: "DRAFT",
          has_pending_changes: true,
          offline_updated_at: new Date().toISOString(),
        };

        await cacheReport(updatedMission);
        await queueMissionStart(missionId, {});

        return updatedMission;
      }
    },
    onSuccess: () => {
      // Invalidate and refresh queries
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Complete mission mutation (offline-capable)
 */
export function useCompleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      missionId,
      workerSignature,
      clientSignature,
      comments,
    }: {
      missionId: string;
      workerSignature: string;
      clientSignature: string;
      comments?: string;
    }) => {
      const signatures = {
        workerSignature,
        clientSignature,
      };

      if (navigator.onLine) {
        // Online: send immediately
        const response = await apiClient.post<{ mission: Report }>(`/missions/${missionId}/complete`, {
          worker_signature_data: workerSignature,
          client_signature_data: clientSignature,
          comments,
        });

        await cacheReport(response.mission);
        return response.mission;
      } else {
        // Offline: update local state and queue for sync
        const cachedMission = await getCachedReport(missionId);
        if (!cachedMission) throw new Error("Mission not found in cache");

        const updatedMission: OfflineReport = {
          ...cachedMission,
          status: "COMPLETED",
          worker_signature_url: workerSignature, // Store base64 temporarily
          client_signature_url: clientSignature,
          comments,
          completed_at: new Date().toISOString(),
          has_pending_changes: true,
          offline_updated_at: new Date().toISOString(),
        };

        await cacheReport(updatedMission);
        await queueMissionComplete(missionId, { signatures, comments });

        return updatedMission;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}

/**
 * Upload photos mutation (offline-capable)
 */
export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, type, files }: { missionId: string; type: "before" | "after"; files: File[] }) => {
      if (navigator.onLine) {
        // Online: upload immediately
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await apiClient.upload<{ photos: Photo[] }>(`/missions/${missionId}/photos/${type}`, formData);

        // Cache the photos with their server URLs
        if (response.photos) {
          for (const photo of response.photos) {
            await cacheReport({ id: missionId } as Report, [photo]);
          }
        }

        return response.photos;
      } else {
        // Offline: store blobs and queue for upload
        const photos: Photo[] = [];
        const filesToQueue: { file: Blob; filename: string }[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const photoId = `temp-${missionId}-${type}-${i}-${Date.now()}`;

          // Create temporary photo record
          const photo: Photo = {
            id: photoId,
            report_id: missionId,
            type,
            url: "", // Will be set when uploaded
            storage_path: "",
            order: i,
            file,
            preview: URL.createObjectURL(file),
          };

          photos.push(photo);
          filesToQueue.push({ file, filename: file.name });

          // Store blob in IndexedDB
          await cachePhotoBlob(photoId, file);
        }

        // Queue for upload
        await queuePhotoUpload(missionId, type, filesToQueue);

        return photos;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missionKeys.all });
    },
  });
}
