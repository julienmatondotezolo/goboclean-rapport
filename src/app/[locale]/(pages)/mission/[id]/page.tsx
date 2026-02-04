'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Clock, FileText, Phone, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';

// Mock mission data - In a real app, this would come from a database
const getMissionById = (id: string) => {
  const missions: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Chemical Spill Cleanup',
      jobType: 'Roofing',
      time: '08:30 AM',
      location: {
        name: 'Logistics Hub - Sector B4',
        address: '42 Industrial Way, Docking Area 7, NJ 07001',
      },
      description:
        'Urgent cleanup required for a Class 3 flammable liquid spill in the loading dock area. Area has been cordoned off by security. Requires full PPE, absorbent pads, and neutralized disposal containers.',
      tasks: [
        { id: 1, text: 'Neutralize spill area (10sqm)', completed: true },
        { id: 2, text: 'Decontamination of floor surface', completed: true },
      ],
      contact: {
        name: 'John Anderson',
        role: 'SITE MANAGER',
        avatar: '👨‍💼',
      },
    },
    '2': {
      id: '2',
      title: 'Roof Inspection',
      jobType: 'Roofing',
      time: '10:00 AM',
      location: {
        name: 'Downtown Office Complex',
        address: '124 Oak Street, Suite 400, NY 10001',
      },
      description:
        'Complete roof inspection for commercial building. Check for leaks, structural integrity, and maintenance needs. Document all findings with photos.',
      tasks: [
        { id: 1, text: 'Inspect roof membrane', completed: false },
        { id: 2, text: 'Check drainage systems', completed: false },
        { id: 3, text: 'Document damage areas', completed: false },
      ],
      contact: {
        name: 'Sarah Mitchell',
        role: 'FACILITY MANAGER',
        avatar: '👩‍💼',
      },
    },
  };

  return missions[id] || missions['1'];
};

export default function MissionDetailPage() {
  const params = useParams();
  const t = useTranslations('Mission');
  const id = params.id as string;
  const mission = getMissionById(id);

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Page Header with dynamic title */}
      <PageHeader title={mission.title} />

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Job Type and Time Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Job Type */}
          <div className="bg-[#f8fafc] rounded-2xl p-4">
            <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
              {t('jobType')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-[#a3e635]">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-gray-900">{mission.jobType}</span>
            </div>
          </div>

          {/* Rendez-vous Time */}
          <div className="bg-[#f8fafc] rounded-2xl p-4">
            <div className="text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
              {t('rendezvous')}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#a3e635]" />
              <span className="text-[15px] font-bold text-gray-900">{mission.time}</span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
            {t('address')}
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-[#a3e635]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">{mission.location.name}</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">{mission.location.address}</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm hover:shadow-md transition-all ml-3">
              <svg
                className="w-5 h-5 text-[#064e3b]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mission Description */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
            {t('missionDescription')}
          </div>
          <p className="text-[14px] text-gray-700 leading-relaxed mb-4">{mission.description}</p>

          {/* Task List */}
          <div className="space-y-2">
            {mission.tasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    task.completed ? 'bg-[#a3e635]' : 'bg-gray-100'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-gray-900" />}
                </div>
                <span
                  className={`text-[14px] font-medium ${
                    task.completed ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Person */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
            {t('contactPerson')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#a3e635] to-[#84cc16] rounded-2xl flex items-center justify-center text-2xl">
                {mission.contact.avatar}
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">{mission.contact.name}</h3>
                <p className="text-[11px] font-bold text-gray-500 tracking-wide">
                  {mission.contact.role}
                </p>
              </div>
            </div>
            <button className="w-14 h-14 bg-[#064e3b] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
              <Phone className="w-6 h-6 text-[#a3e635]" />
            </button>
          </div>
        </div>

        {/* Start Mission Button */}
        <div className="pt-4">
          <Button className="w-full">
            <FileText className="w-5 h-5" />
            <span className="text-[15px] font-bold uppercase tracking-wide">{t('startMission')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
