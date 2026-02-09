'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  X,
  Loader2,
  AlertCircle,
  CalendarX2,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarMissions, useRescheduleMission } from '@/hooks/useMissions';
import { showSuccess, handleError } from '@/lib/error-handler';
import { LoadingBanner } from '@/components/loading-banner';
import type { Mission } from '@/types/mission';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday as dateIsToday,
  getDaysInMonth,
  getDay,
} from 'date-fns';
import { nl, fr, enUS } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month';

export default function SchedulePage() {
  const t = useTranslations('Schedule');
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading, isAuthenticated } = useAuth();
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [draggedMission, setDraggedMission] = useState<string | null>(null);

  const rescheduleMutation = useRescheduleMission();

  // Pick the correct date-fns locale
  const dateFnsLocale = locale === 'nl' ? nl : locale === 'fr' ? fr : enUS;

  // Compute date range for the calendar query
  const dateRange = useMemo(() => {
    let start: Date;
    let end: Date;
    if (viewMode === 'day') {
      start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    }
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    };
  }, [currentDate, viewMode]);

  const {
    data: rawMissions,
    isLoading,
    isError,
    refetch,
  } = useCalendarMissions(dateRange, { enabled: !authLoading && isAuthenticated && !!user });

  // Change 5: Worker sees only own missions
  const missions = useMemo(() => {
    if (!rawMissions) return undefined;
    if (isAdmin) return rawMissions;
    // Filter to only missions assigned to the current worker
    if (!user) return [];
    return rawMissions.filter(
      (m) => m.assigned_workers?.includes(user.id),
    );
  }, [rawMissions, isAdmin, user]);

  // Navigation
  const navigatePrev = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, -1));
    else if (viewMode === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subMonths(d, 1));
  };

  const navigateNext = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  };

  // Current week days for day/week header
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Missions for a specific day
  const getMissionsForDay = useCallback(
    (day: Date) => {
      if (!missions) return [];
      return missions
        .filter((m) => {
          const appt = new Date(m.appointment_time);
          return isSameDay(appt, day) && m.status !== 'cancelled';
        })
        .sort(
          (a, b) =>
            new Date(a.appointment_time).getTime() -
            new Date(b.appointment_time).getTime(),
        );
    },
    [missions],
  );

  // Missions for the currently selected day (used in day view and month click)
  const selectedDayMissions = useMemo(
    () => getMissionsForDay(viewMode === 'day' ? currentDate : selectedDay),
    [getMissionsForDay, currentDate, selectedDay, viewMode],
  );

  // Change 8: All missions for the current week
  const allWeekMissions = useMemo(() => {
    if (!missions) return [];
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return missions
      .filter((m) => {
        const d = new Date(m.appointment_time);
        return d >= start && d <= end && m.status !== 'cancelled';
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_time).getTime() -
          new Date(b.appointment_time).getTime(),
      );
  }, [missions, currentDate]);

  // Change 9: All missions for the current month
  const allMonthMissions = useMemo(() => {
    if (!missions) return [];
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return missions
      .filter((m) => {
        const d = new Date(m.appointment_time);
        return d >= start && d <= end && m.status !== 'cancelled';
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_time).getTime() -
          new Date(b.appointment_time).getTime(),
      );
  }, [missions, currentDate]);

  // Days in month that have missions
  const daysWithMissions = useMemo(() => {
    if (!missions) return new Set<number>();
    const s = new Set<number>();
    missions.forEach((m) => {
      const d = new Date(m.appointment_time);
      if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
        s.add(d.getDate());
      }
    });
    return s;
  }, [missions, currentDate]);

  // Month calendar grid
  const monthDays = useMemo(() => {
    const total = getDaysInMonth(currentDate);
    const firstDay = getDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    // Convert Sunday=0 to Monday-based offset
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    return { total, offset };
  }, [currentDate]);

  // Format time helper
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const dayLabels = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];

  // ─── Drag-to-reschedule (admin only) ──────────────────────
  const handleDragStart = (e: React.DragEvent, missionId: string) => {
    if (!isAdmin) return;
    e.dataTransfer.setData('text/plain', missionId);
    setDraggedMission(missionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
  };

  const handleDropOnDay = async (e: React.DragEvent, targetDate: Date) => {
    if (!isAdmin) return;
    e.preventDefault();
    const missionId = e.dataTransfer.getData('text/plain');
    if (!missionId) return;

    // Keep original time, change date
    const original = missions?.find((m) => m.id === missionId);
    if (!original) return;

    const origDate = new Date(original.appointment_time);
    const newDate = new Date(targetDate);
    newDate.setHours(origDate.getHours(), origDate.getMinutes(), 0, 0);

    try {
      await rescheduleMutation.mutateAsync({
        id: missionId,
        data: { appointment_time: newDate.toISOString() },
      });
      showSuccess(t('rescheduled'));
    } catch (err) {
      handleError(err, { title: t('rescheduleFailed') });
    } finally {
      setDraggedMission(null);
    }
  };

  // ─── Mission Card Component ────────────────────────────────
  const MissionItem = ({ mission, compact }: { mission: Mission; compact?: boolean }) => (
    <div
      draggable={isAdmin}
      onDragStart={(e) => handleDragStart(e, mission.id)}
      className={`bg-[#a3e635] rounded-2xl p-4 relative group hover:shadow-lg transition-all cursor-pointer ${
        isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
      } ${draggedMission === mission.id ? 'opacity-50' : ''}`}
      onClick={() => router.push(`/mission/${mission.id}`)}
    >
      {isAdmin && (
        <button
          className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      )}
      <h4 className="font-bold text-[15px] text-gray-900 mb-1">
        {mission.client_first_name} {mission.client_last_name}
      </h4>
      <p className="text-[13px] text-gray-800 font-medium">
        {mission.client_address} • {fmtTime(mission.appointment_time)}
      </p>
      {!compact && mission.mission_subtypes?.length > 0 && (
        <div className="flex gap-1 mt-2">
          {mission.mission_subtypes.map((st) => (
            <span
              key={st}
              className="text-[10px] font-bold bg-gray-900/10 text-gray-900 px-2 py-0.5 rounded-md uppercase"
            >
              {st}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Mission list item (for month/week "all missions" lists) ──
  const MissionListItem = ({ mission }: { mission: Mission }) => (
    <div
      draggable={isAdmin}
      onDragStart={(e) => handleDragStart(e, mission.id)}
      className={`bg-[#f0fdf4] border border-[#a3e635]/20 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer hover:border-[#a3e635]/40 ${
        isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      onClick={() => router.push(`/mission/${mission.id}`)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#a3e635] rounded-xl flex items-center justify-center flex-shrink-0">
          <Home className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <h4 className="font-bold text-[15px] text-gray-900 mb-0.5">
            {mission.client_first_name} {mission.client_last_name}
          </h4>
          <p className="text-[13px] text-gray-600 font-medium">
            {format(new Date(mission.appointment_time), 'EEE d MMM', { locale: dateFnsLocale })} • {fmtTime(mission.appointment_time)} • {mission.client_address}
          </p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </div>
  );

  // ─── Loading / Error states ────────────────────────────────
  // Loading handled by banner instead of full page block

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Loading Banner */}
      <LoadingBanner 
        isLoading={isLoading} 
        message="Loading schedule..." 
      />
      
      {/* Page Header */}
      <div className={isLoading ? 'pt-16' : ''}>
        <PageHeader title={t('title')} />
      </div>

      {/* View Switcher */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-10">
        <div className="px-6 py-4">
          <div className="flex gap-2 bg-[#f1f5f9] rounded-xl p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t(mode)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="px-6 py-8">
          <div className="bg-red-50 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-red-700 mb-2">{t('errorLoading')}</p>
            <button
              onClick={() => refetch()}
              className="text-[13px] font-bold text-[#064e3b] hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && !isError && (
        <div className="px-6 py-6 bg-[#f8fafc]">
          {/* Week Days Header with Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={navigatePrev} className="w-8 h-8 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <span className="text-[14px] font-bold text-gray-700">
              {format(currentDate, 'MMMM yyyy', { locale: dateFnsLocale })}
            </span>
            <button onClick={navigateNext} className="w-8 h-8 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-8">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, currentDate);
              return (
                <button
                  key={index}
                  onClick={() => setCurrentDate(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDay(e, day)}
                  className="text-center"
                >
                  <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide">
                    {dayLabels[index]}
                  </div>
                  <div
                    className={`text-base font-bold py-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#a3e635] text-gray-900 shadow-md'
                        : dateIsToday(day)
                        ? 'bg-[#064e3b] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Timeline — Change 7: use missions for currentDate in day view */}
          {selectedDayMissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
              <CalendarX2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-gray-500">{t('noMissionsForDay')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayMissions.map((mission, index) => (
                <div key={mission.id} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="text-[13px] font-semibold text-gray-500 w-16 pt-4 flex-shrink-0">
                      {fmtTime(mission.appointment_time)}
                    </div>
                    <div className="flex-1">
                      <MissionItem mission={mission} />
                    </div>
                  </div>
                  {index < selectedDayMissions.length - 1 && (
                    <div className="ml-[4.5rem] mt-2 mb-2 border-l-2 border-dashed border-gray-300 h-3" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Mission Button (admin only) */}
          {isAdmin && (
            <div className="flex items-center gap-4 mt-4">
              <div className="text-[13px] font-semibold text-gray-500 w-16 flex-shrink-0" />
              <button
                onClick={() => router.push('/mission/new')}
                className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl py-5 flex items-center justify-center gap-2 text-gray-400 hover:border-[#a3e635] hover:text-[#064e3b] hover:bg-[#a3e635]/5 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-bold text-sm">{t('addMission')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && !isError && (
        <div className="px-6 py-6 bg-[#f8fafc]">
          {/* Navigation — Change 6: translated dates */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={navigatePrev} className="w-8 h-8 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <span className="text-[14px] font-bold text-gray-700">
              {format(weekDays[0], 'd MMM', { locale: dateFnsLocale })} - {format(weekDays[6], 'd MMM yyyy', { locale: dateFnsLocale })}
            </span>
            <button onClick={navigateNext} className="w-8 h-8 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDay);
              const dayMissions = getMissionsForDay(day);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDay(e, day)}
                  className="text-center"
                >
                  <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide">
                    {dayLabels[index]}
                  </div>
                  <div
                    className={`text-base font-bold py-2.5 rounded-xl transition-all relative ${
                      isSelected
                        ? 'bg-[#a3e635] text-gray-900 shadow-md'
                        : dateIsToday(day)
                        ? 'bg-[#064e3b] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {format(day, 'd')}
                    {dayMissions.length > 0 && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Change 8: All week missions underneath */}
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-5">
              {t('allWeekMissions')}
            </h3>
            {allWeekMissions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                <CalendarX2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-[14px] font-bold text-gray-500">{t('noMissionsForDay')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allWeekMissions.map((mission) => (
                  <MissionListItem key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </div>

          {/* Add Mission Button (admin only) */}
          {isAdmin && (
            <div className="flex items-center gap-4 mt-4">
              <div className="text-[13px] font-semibold text-gray-500 w-16 flex-shrink-0" />
              <button
                onClick={() => router.push('/mission/new')}
                className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl py-5 flex items-center justify-center gap-2 text-gray-400 hover:border-[#a3e635] hover:text-[#064e3b] hover:bg-[#a3e635]/5 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-bold text-sm">{t('addMission')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && !isError && (
        <div className="px-6 py-6 bg-[#f8fafc]">
          {/* Month Navigation — Change 6: translated month names */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={navigatePrev}
              className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center transition-all shadow-sm hover:shadow"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-[20px] font-bold text-gray-900 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: dateFnsLocale })}
            </h2>
            <button
              onClick={navigateNext}
              className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center transition-all shadow-sm hover:shadow"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-10">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {dayLabels.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-bold text-gray-500 py-2 tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty offset cells */}
              {Array.from({ length: monthDays.offset }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Month days */}
              {Array.from({ length: monthDays.total }, (_, i) => {
                const day = i + 1;
                const dayDate = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day,
                );
                const isSelected = isSameDay(dayDate, selectedDay);
                const isCurrentDay = dateIsToday(dayDate);
                const hasMissions = daysWithMissions.has(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(dayDate)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnDay(e, dayDate)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? 'bg-[#a3e635] text-gray-900 font-bold shadow-md scale-105'
                        : isCurrentDay
                        ? 'bg-[#064e3b] text-white font-bold'
                        : hasMissions
                        ? 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm'
                        : 'hover:bg-white text-gray-700'
                    }`}
                  >
                    <span
                      className={`text-[15px] ${isSelected || isCurrentDay || hasMissions ? 'font-bold' : 'font-medium'}`}
                    >
                      {day}
                    </span>
                    {hasMissions && !isSelected && !isCurrentDay && (
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-[#a3e635]" />
                    )}
                    {(isSelected || isCurrentDay) && hasMissions && (
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-gray-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Missions for Selected Day */}
          <div className="mb-10">
            <h3 className="text-[18px] font-bold text-gray-900 mb-5">
              {t('missions')} - {format(selectedDay, 'd MMM', { locale: dateFnsLocale })}
            </h3>
            {getMissionsForDay(selectedDay).length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
                <p className="text-[14px] text-gray-400">{t('noMissionsForDay')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getMissionsForDay(selectedDay).map((mission) => (
                  <div
                    key={mission.id}
                    draggable={isAdmin}
                    onDragStart={(e) => handleDragStart(e, mission.id)}
                    className={`bg-[#f0fdf4] border border-[#a3e635]/20 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer hover:border-[#a3e635]/40 ${
                      isAdmin ? 'cursor-grab active:cursor-grabbing' : ''
                    }`}
                    onClick={() => router.push(`/mission/${mission.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#a3e635] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-gray-900" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[15px] text-gray-900 mb-0.5">
                          {mission.client_first_name} {mission.client_last_name}
                        </h4>
                        <p className="text-[13px] text-gray-600 font-medium">
                          {fmtTime(mission.appointment_time)} • {mission.client_address}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Change 9: All missions this month */}
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-5">
              {t('allMonthMissions')}
            </h3>
            {allMonthMissions.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
                <p className="text-[14px] text-gray-400">{t('noMissions')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allMonthMissions.map((mission) => (
                  <MissionListItem key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
