'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Plus, Home, Wrench, X, Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';

type ViewMode = 'day' | 'week' | 'month';

interface Mission {
  id: string;
  title: string;
  location: string;
  duration: string;
  time: string;
  type: 'roof' | 'gutter' | 'shingle' | 'admin';
}

interface PendingMission {
  id: string;
  title: string;
  location: string;
  priority: string;
}

export default function SchedulePage() {
  const t = useTranslations('Schedule');
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 5)); // Oct 5, 2023

  // Translated day names
  const dayNames = [t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')];
  const dayNamesFull = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];

  // Sample missions for the day view
  const dayMissions: Mission[] = [
    {
      id: '1',
      title: t('roofInspection'),
      location: '124 Oak Street',
      duration: '2h',
      time: '08:00 AM',
      type: 'roof',
    },
    {
      id: '2',
      title: t('gutterCleaning'),
      location: '456 Pine Ave',
      duration: '1.5h',
      time: '10:00 AM',
      type: 'gutter',
    },
    {
      id: '3',
      title: t('shingleReplacement'),
      location: '789 Maple Dr',
      duration: '4h',
      time: '12:00 PM',
      type: 'shingle',
    },
    {
      id: '4',
      title: t('adminReporting'),
      location: 'Main Office',
      duration: '1h',
      time: '04:00 PM',
      type: 'admin',
    },
  ];

  // Pending missions
  const pendingMissions: PendingMission[] = [
    {
      id: '1',
      title: t('emergencyLeakRepair'),
      location: '321 Birch Rd',
      priority: t('highPriority'),
    },
  ];

  // Month calendar data
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 0; // Sunday
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);
  
  // Days with missions (for visual indicators)
  const daysWithMissions = [1, 4, 5, 7, 10];

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'roof':
        return <Home className="w-5 h-5 text-gray-900" />;
      case 'gutter':
        return <Wrench className="w-5 h-5 text-gray-900" />;
      case 'shingle':
        return <Wrench className="w-5 h-5 text-gray-900" />;
      case 'admin':
        return <Briefcase className="w-5 h-5 text-gray-900" />;
      default:
        return <Home className="w-5 h-5 text-gray-900" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Page Header */}
      <PageHeader title={t('title')} />

      {/* View Switcher */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-10">
        <div className="px-6 py-4">
          {/* View Mode Tabs */}
          <div className="flex gap-2 bg-[#f1f5f9] rounded-xl p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('day')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('week')}
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('month')}
            </button>
          </div>
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="px-6 py-6 bg-[#f8fafc]">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide">{day}</div>
                <div
                  className={`text-base font-bold py-2.5 rounded-xl transition-all ${
                    index === 1
                      ? 'bg-[#a3e635] text-gray-900 shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {23 + index}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            {dayMissions.map((mission, index) => (
              <div key={mission.id} className="relative">
                {/* Time Label and Mission Card */}
                <div className="flex items-start gap-4">
                  <div className="text-[13px] font-semibold text-gray-500 w-16 pt-4 flex-shrink-0">
                    {mission.time}
                  </div>
                  
                  {/* Mission Card */}
                  <div className="flex-1 bg-[#a3e635] rounded-2xl p-4 relative group hover:shadow-lg transition-all">
                    <button className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <h4 className="font-bold text-[15px] text-gray-900 mb-1">{mission.title}</h4>
                    <p className="text-[13px] text-gray-800 font-medium">
                      {mission.location} • {mission.duration}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < dayMissions.length - 1 && (
                  <div className="ml-[4.5rem] mt-2 mb-2 border-l-2 border-dashed border-gray-300 h-3" />
                )}
              </div>
            ))}

            {/* Add Mission Button */}
            <div className="flex items-center gap-4 mt-4">
              <div className="text-[13px] font-semibold text-gray-500 w-16 flex-shrink-0">02 PM</div>
              <button className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl py-5 flex items-center justify-center gap-2 text-gray-400 hover:border-[#a3e635] hover:text-[#064e3b] hover:bg-[#a3e635]/5 transition-all">
                <Plus className="w-5 h-5" />
                <span className="font-bold text-sm">{t('addMission')}</span>
              </button>
            </div>
          </div>

          {/* Pending Approval Section */}
          <div className="mt-10">
            <h3 className="text-[18px] font-bold text-gray-900 mb-5">{t('pendingApproval')}</h3>
            {pendingMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-[#fef9c3] rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fbbf24] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-gray-900 mb-0.5">{mission.title}</h4>
                    <p className="text-[13px] text-gray-600 font-medium">
                      {mission.location} • <span className="text-orange-600">{mission.priority}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="px-6 py-6 bg-[#f8fafc]">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {dayNames.map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide">{day}</div>
                <div
                  className={`text-base font-bold py-2.5 rounded-xl transition-all ${
                    index === 1
                      ? 'bg-[#a3e635] text-gray-900 shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {23 + index}
                </div>
              </div>
            ))}
          </div>

          {/* Missions Grid */}
          <div className="space-y-2">
            {dayMissions.map((mission, index) => (
              <div key={mission.id}>
                <div className="flex items-start gap-4">
                  <div className="text-[13px] font-semibold text-gray-500 w-16 pt-4 flex-shrink-0">
                    {mission.time}
                  </div>
                  <div className="flex-1 bg-[#a3e635] rounded-2xl p-4 relative group hover:shadow-lg transition-all">
                    <button className="absolute top-3 right-3 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <h4 className="font-bold text-[15px] text-gray-900 mb-1">{mission.title}</h4>
                    <p className="text-[13px] text-gray-800 font-medium">
                      {mission.location} • {mission.duration}
                    </p>
                  </div>
                </div>
                {index < dayMissions.length - 1 && (
                  <div className="ml-[4.5rem] mt-2 mb-2 border-l-2 border-dashed border-gray-300 h-3" />
                )}
              </div>
            ))}

            <div className="flex items-center gap-4 mt-4">
              <div className="text-[13px] font-semibold text-gray-500 w-16 flex-shrink-0">02 PM</div>
              <button className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl py-5 flex items-center justify-center gap-2 text-gray-400 hover:border-[#a3e635] hover:text-[#064e3b] hover:bg-[#a3e635]/5 transition-all">
                <Plus className="w-5 h-5" />
                <span className="font-bold text-sm">{t('addMission')}</span>
              </button>
            </div>
          </div>

          {/* Pending Approval */}
          <div className="mt-10">
            <h3 className="text-[18px] font-bold text-gray-900 mb-5">{t('pendingApproval')}</h3>
            {pendingMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-[#fef9c3] rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fbbf24] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px] text-gray-900 mb-0.5">{mission.title}</h4>
                    <p className="text-[13px] text-gray-600 font-medium">
                      {mission.location} • <span className="text-orange-600">{mission.priority}</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="px-6 py-6 bg-[#f8fafc]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center transition-all shadow-sm hover:shadow"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-[20px] font-bold text-gray-900">{formatDate(currentDate)}</h2>
            <button
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center transition-all shadow-sm hover:shadow"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mb-10">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {dayNamesFull.map((day) => (
                <div key={day} className="text-center text-[11px] font-bold text-gray-500 py-2 tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty days */}
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Month days */}
              {daysInMonth.map((day) => {
                const isToday = day === 5;
                const hasMissions = daysWithMissions.includes(day);

                return (
                  <button
                    key={day}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                      isToday
                        ? 'bg-[#a3e635] text-gray-900 font-bold shadow-md scale-105'
                        : hasMissions
                        ? 'bg-white text-gray-900 hover:bg-gray-50 shadow-sm'
                        : 'hover:bg-white text-gray-700'
                    }`}
                  >
                    <span className={`text-[15px] ${isToday || hasMissions ? 'font-bold' : 'font-medium'}`}>
                      {day}
                    </span>
                    {hasMissions && !isToday && (
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-[#a3e635]" />
                    )}
                    {isToday && (
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-gray-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Missions for Selected Day */}
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-5">{t('missions')} - Oct 5</h3>
            <div className="space-y-3">
              {dayMissions.slice(0, 2).map((mission) => (
                <div
                  key={mission.id}
                  className="bg-[#f0fdf4] border border-[#a3e635]/20 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer hover:border-[#a3e635]/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#a3e635] rounded-xl flex items-center justify-center flex-shrink-0">
                      {getMissionIcon(mission.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-[15px] text-gray-900 mb-0.5">{mission.title}</h4>
                      <p className="text-[13px] text-gray-600 font-medium">
                        {mission.time} - {mission.duration}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
