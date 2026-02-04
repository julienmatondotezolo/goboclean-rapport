'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Clock, FileText, Phone, CheckCircle2, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Mock mission data - In a real app, this would come from a database
const getMissionById = (id: string) => {
  const missions: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Chemical Spill Cleanup',
      jobType: 'Roofing',
      time: '08:30 AM',
      status: 'noodgeval',
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
      title: 'Floor Degreasing',
      jobType: 'Industrial Cleaning',
      time: '14:30',
      status: 'gepland',
      location: {
        name: 'Manufacturing Plant - Zone A',
        address: '124 Oak Street, Suite 400, NY 10001',
      },
      description:
        'Complete floor degreasing for manufacturing facility. Remove oil stains, grease buildup, and ensure proper surface preparation.',
      tasks: [
        { id: 1, text: 'Pre-inspection of floor area', completed: true },
        { id: 2, text: 'Apply degreasing solution', completed: false },
        { id: 3, text: 'Pressure wash and rinse', completed: false },
      ],
      contact: {
        name: 'Sarah Mitchell',
        role: 'FACILITY MANAGER',
        avatar: '👩‍💼',
      },
      beforePictures: [
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
        'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=800&q=80',
      ],
    },
    '3': {
      id: '3',
      title: 'Ventilation Service',
      jobType: 'Maintenance',
      time: 'Tomorrow',
      status: 'gepland',
      location: {
        name: 'Storage Facility 3',
        address: '456 Industrial Blvd, Warehouse District, NJ 07002',
      },
      description:
        'Scheduled ventilation system service and filter replacement for storage facility.',
      tasks: [
        { id: 1, text: 'Inspect ventilation ducts', completed: false },
        { id: 2, text: 'Replace air filters', completed: false },
        { id: 3, text: 'Test airflow', completed: false },
      ],
      contact: {
        name: 'Mike Johnson',
        role: 'OPERATIONS MANAGER',
        avatar: '👨‍💼',
      },
    },
  };

  return missions[id] || missions['1'];
};

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('Mission');
  const id = params.id as string;
  const mission = getMissionById(id);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const isScheduledMission = mission.status === 'gepland';
  const hasBeforePictures = mission.beforePictures && mission.beforePictures.length > 0;

  const handleConfirmMission = () => {
    if (isScheduledMission) {
      // For scheduled missions, go to after-pictures
      router.push(`/${params.locale}/mission/${id}/after-pictures`);
    } else {
      // For emergency missions, go to before-pictures
      router.push(`/${params.locale}/mission/${id}/before-pictures`);
    }
  };

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
              <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-[#a3e635]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">{mission.location.name}</h3>
                <p className="text-[13px] text-gray-600 leading-relaxed">{mission.location.address}</p>
              </div>
            </div>
            <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-all ml-3">
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
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

        {/* Before Pictures Section - Only show for scheduled missions */}
        {isScheduledMission && hasBeforePictures && (
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
              {t('beforePictures')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mission.beforePictures.map((photo: string, index: number) => (
                <div
                  key={index}
                  onClick={() => setFullScreenImage(photo)}
                  className="relative rounded-xl overflow-hidden border-2 border-gray-200 bg-white cursor-pointer hover:border-[#a3e635] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ aspectRatio: '3/2' }}
                >
                  <Image
                    src={photo}
                    alt={`Before photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {/* Photo number badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {index + 1}/4
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Person */}
        <div className="bg-[#f8fafc] rounded-2xl p-5">
          <div className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
            {t('contactPerson')}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-[#a3e635] to-[#84cc16] rounded-2xl flex items-center justify-center text-2xl">
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

        {/* Confirm Mission Button */}
        <div className="pt-4">
          <Button onClick={handleConfirmMission} className="w-full">
            <FileText className="w-5 h-5" />
            <span className="text-[15px] font-bold uppercase tracking-wide">
              {isScheduledMission ? t('completeMission') : t('startMission')}
            </span>
          </Button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] p-4">
            <Image
              src={fullScreenImage}
              alt="Full screen view"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
