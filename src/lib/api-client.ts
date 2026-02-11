import { createClient } from "./supabase/client";
import logger from "./logger";

/**
 * API Client for making authenticated requests to the backend
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  /**
   * Get the current user's access token with automatic refresh
   */
  private async getAccessToken(): Promise<string | null> {
    const supabase = createClient();

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry < 300) {
      // Less than 5 minutes
      console.log("🔄 Token expiring soon, refreshing...");

      try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error("❌ Token refresh failed:", error.message);
          // Return the existing token, might still be valid briefly
          return session.access_token;
        }

        if (data.session) {
          console.log("✅ Token refreshed in API client");
          return data.session.access_token;
        }
      } catch (error) {
        console.error("❌ Token refresh error:", error);
        return session.access_token;
      }
    }

    return session.access_token;
  }

  /**
   * Capture the caller information from stack trace
   */
  private getCallerContext(): { caller: string; hook?: string; component?: string } {
    const stack = new Error().stack || "";
    const lines = stack.split("\n");

    let caller = "unknown";
    let hook: string | undefined;
    let component: string | undefined;

    // Look for hook or component in stack trace
    for (const line of lines) {
      // Skip api-client.ts and internal calls
      if (line.includes("api-client.ts") || line.includes("ApiClient")) continue;

      // Check for hooks (useMissions, useAuth, etc.)
      const hookMatch = line.match(/use[A-Z]\w+/);
      if (hookMatch && !hook) {
        hook = hookMatch[0];
      }

      // Check for component files
      const componentMatch = line.match(/([A-Z]\w+(?:Page|Component|Card|Modal|Form|Layout))\.tsx?/);
      if (componentMatch && !component) {
        component = componentMatch[1];
      }

      // Extract file and line number for caller
      if (!caller || caller === "unknown") {
        const fileMatch = line.match(/([^/]+\.tsx?):(\d+):(\d+)/);
        if (fileMatch) {
          const [, fileName, lineNum] = fileMatch;
          caller = `${fileName}:${lineNum}`;
        }
      }

      // If we found both hook and component, we're done
      if (hook && component) break;
    }

    return { caller, hook, component };
  }

  /**
   * Make an authenticated request to the backend
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = options.method || "GET";
    const startTime = Date.now();
    const callerContext = this.getCallerContext();

    // Log API call start
    logger.apiCall(method, endpoint, {
      hasAuth: !!(await this.getAccessToken()),
      bodySize: options.body ? JSON.stringify(options.body).length : 0,
      ...callerContext,
    });

    try {
      const token = await this.getAccessToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Add timeout to prevent infinite hangs
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if ((fetchError as Error).name === "AbortError") {
          throw new Error("Request timeout - please try again");
        }
        throw fetchError;
      }

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || "Request failed" };
        }

        const error = new Error(errorData.message || `HTTP ${response.status}`);

        // Log API error
        logger.apiError(method, endpoint, error, {
          status: response.status,
          statusText: response.statusText,
          responseTime,
          errorData,
          ...callerContext,
        });

        throw error;
      }

      const result = await response.json();

      // Log API success
      logger.apiSuccess(method, endpoint, responseTime, {
        status: response.status,
        responseSize: JSON.stringify(result).length,
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof Error && !error.message.includes("HTTP")) {
        // This is a network/fetch error, not an HTTP error
        logger.apiError(method, endpoint, error, {
          responseTime,
          errorType: "network",
          ...callerContext,
        });
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  /**
   * Upload FormData (multipart/form-data) — does NOT set Content-Type so
   * the browser adds the correct boundary automatically.
   */
  async upload<T>(endpoint: string, formData: FormData, onProgress?: (percent: number) => void): Promise<T> {
    const startTime = Date.now();
    const fileCount = Array.from(formData.entries()).filter(([key, value]) => value instanceof File).length;
    const callerContext = this.getCallerContext();

    // Log upload start
    logger.apiCall("POST", endpoint, {
      uploadType: "multipart/form-data",
      fileCount,
      hasProgress: !!onProgress,
      ...callerContext,
    });

    try {
      const token = await this.getAccessToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // If caller doesn't need progress we can use fetch directly
      if (!onProgress) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers,
          body: formData,
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || "Upload failed" };
          }

          const error = new Error(errorData.message || `HTTP ${response.status}`);

          // Log upload error
          logger.apiError("POST", endpoint, error, {
            status: response.status,
            statusText: response.statusText,
            responseTime,
            uploadType: "fetch",
            fileCount,
            ...callerContext,
          });

          throw error;
        }

        const result = await response.json();

        // Log upload success
        logger.apiSuccess("POST", endpoint, responseTime, {
          status: response.status,
          uploadType: "fetch",
          fileCount,
        });

        return result;
      }

      // Use XMLHttpRequest for progress tracking
      return new Promise<T>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${this.baseUrl}${endpoint}`);

        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);

            // Log progress milestones
            if (percent === 25 || percent === 50 || percent === 75) {
              logger.debug(`Upload progress: ${percent}%`, {
                action: "upload_progress",
                endpoint,
                percent,
                loaded: e.loaded,
                total: e.total,
              });
            }
          }
        });

        xhr.addEventListener("load", () => {
          const responseTime = Date.now() - startTime;

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);

              // Log upload success
              logger.apiSuccess("POST", endpoint, responseTime, {
                status: xhr.status,
                uploadType: "xhr",
                fileCount,
                responseSize: xhr.responseText.length,
              });

              resolve(result);
            } catch {
              const result = xhr.responseText as unknown as T;

              // Log upload success (non-JSON response)
              logger.apiSuccess("POST", endpoint, responseTime, {
                status: xhr.status,
                uploadType: "xhr",
                fileCount,
                responseType: "text",
              });

              resolve(result);
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(xhr.responseText);
            } catch {
              errorData = { message: `HTTP ${xhr.status}` };
            }

            const error = new Error(errorData.message || `HTTP ${xhr.status}`);

            // Log upload error
            logger.apiError("POST", endpoint, error, {
              status: xhr.status,
              statusText: xhr.statusText,
              responseTime,
              uploadType: "xhr",
              fileCount,
              errorData,
              ...callerContext,
            });

            reject(error);
          }
        });

        xhr.addEventListener("error", () => {
          const error = new Error("Network error");
          logger.apiError("POST", endpoint, error, {
            responseTime: Date.now() - startTime,
            uploadType: "xhr",
            fileCount,
            errorType: "network",
            ...callerContext,
          });
          reject(error);
        });

        xhr.addEventListener("abort", () => {
          const error = new Error("Upload aborted");
          logger.apiError("POST", endpoint, error, {
            responseTime: Date.now() - startTime,
            uploadType: "xhr",
            fileCount,
            errorType: "abort",
            ...callerContext,
          });
          reject(error);
        });

        xhr.send(formData);
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (error instanceof Error) {
        logger.apiError("POST", endpoint, error, {
          responseTime,
          uploadType: onProgress ? "xhr" : "fetch",
          fileCount,
          errorType: "setup",
          ...callerContext,
        });
      }

      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Example usage:
// import { apiClient } from '@/lib/api-client';
//
// // Get reports
// const reports = await apiClient.get('/reports');
//
// // Generate PDF
// await apiClient.post('/reports/123/generate-pdf');
//
// // Get current user profile
// const profile = await apiClient.get('/auth/me');
