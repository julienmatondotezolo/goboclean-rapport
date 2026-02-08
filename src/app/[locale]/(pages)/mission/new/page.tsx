'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Calendar, Clock, FileText, Home, CheckCircle2, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { useWorkersList } from '@/hooks/useWorkers';
import { useCreateMission } from '@/hooks/useMissions';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, handleError } from '@/lib/error-handler';
import type { CreateMissionPayload, MissionSubtype } from '@/types/mission';

interface ClientInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  appointmentDate: string;
  appointmentTime: string;
}

interface MissionDetails {
  missionType: 'roof' | 'industrial';
  additionalInformation: string;
  subTypes: {
    cleaning: boolean;
    coating: boolean;
  };
  surfaceArea: string;
  facadeNumber: string;
  features: {
    frontParking: boolean;
    garden: boolean;
    balcony: boolean;
    terrace: boolean;
    veranda: boolean;
    swimmingPool: boolean;
    greenhouse: boolean;
    pergola: boolean;
    awning: boolean;
    solarPanels: boolean;
  };
}

const TOTAL_STEPS = 3;

export default function MissionCreatePage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('MissionCreate');
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  
  // Redirect workers away — admin only page
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace(`/${params.locale}/dashboard`);
    }
  }, [authLoading, isAdmin, router, params.locale]);

  // Real API hooks
  const { data: workers, isLoading: workersLoading } = useWorkersList();
  const createMission = useCreateMission();

  // Block render for non-admins
  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#064e3b]" />
      </div>
    );
  }

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    appointmentDate: '',
    appointmentTime: '',
  });

  const [missionDetails, setMissionDetails] = useState<MissionDetails>({
    missionType: 'roof',
    additionalInformation: '',
    subTypes: {
      cleaning: false,
      coating: false,
    },
    surfaceArea: '',
    facadeNumber: '1',
    features: {
      frontParking: false,
      garden: false,
      balcony: false,
      terrace: false,
      veranda: false,
      swimmingPool: false,
      greenhouse: false,
      pergola: false,
      awning: false,
      solarPanels: false,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!clientInfo.firstName.trim()) {
      newErrors.firstName = t('requiredField');
    }
    if (!clientInfo.lastName.trim()) {
      newErrors.lastName = t('requiredField');
    }
    if (!clientInfo.phone.trim()) {
      newErrors.phone = t('requiredField');
    } else if (!/^\+?[\d\s\-()]+$/.test(clientInfo.phone)) {
      newErrors.phone = t('invalidPhone');
    }
    if (!clientInfo.email.trim()) {
      newErrors.email = t('requiredField');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
      newErrors.email = t('invalidEmail');
    }
    if (!clientInfo.address.trim()) {
      newErrors.address = t('requiredField');
    }
    if (!clientInfo.appointmentDate.trim()) {
      newErrors.appointmentDate = t('requiredField');
    }
    if (!clientInfo.appointmentTime.trim()) {
      newErrors.appointmentTime = t('requiredField');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!missionDetails.subTypes.cleaning && !missionDetails.subTypes.coating) {
      newErrors.subTypes = t('requiredField');
    }

    if (!missionDetails.surfaceArea || parseFloat(missionDetails.surfaceArea) <= 0) {
      newErrors.surfaceArea = t('surfaceAreaRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocateMe = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        setClientInfo({ ...clientInfo, address: coords });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers((prev) => {
      if (prev.includes(workerId)) {
        return prev.filter((id) => id !== workerId);
      } else {
        return [...prev, workerId];
      }
    });
    setErrors({});
  };

  const handleCreateMission = async () => {
    if (selectedWorkers.length === 0) {
      setErrors({ worker: t('workerRequired') });
      return;
    }

    // Build subtypes array
    const subtypes: MissionSubtype[] = [];
    if (missionDetails.subTypes.cleaning) subtypes.push('cleaning');
    if (missionDetails.subTypes.coating) subtypes.push('coating');

    const payload: CreateMissionPayload = {
      client_first_name: clientInfo.firstName,
      client_last_name: clientInfo.lastName,
      client_phone: clientInfo.phone,
      client_email: clientInfo.email || undefined,
      client_address: clientInfo.address,
      appointment_time: new Date(`${clientInfo.appointmentDate}T${clientInfo.appointmentTime}`).toISOString(),
      mission_type: 'roof',
      mission_subtypes: subtypes,
      surface_area: parseFloat(missionDetails.surfaceArea) || undefined,
      facade_count: parseInt(missionDetails.facadeNumber) || 1,
      additional_info: missionDetails.additionalInformation || undefined,
      features: missionDetails.features,
      assigned_workers: selectedWorkers,
    };

    try {
      await createMission.mutateAsync(payload);
      showSuccess(t('createSuccess'));
      router.push(`/${params.locale}/schedule`);
    } catch (error) {
      handleError(error, { title: t('createFailed') });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      <PageHeader title={t('title')} />

      {/* Progress Bar */}
      <div className="px-6 pt-4 pb-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              {t('step')} {currentStep} {t('of')} {TOTAL_STEPS}
            </span>
            <span className="text-[11px] font-bold text-[#064e3b]">{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2 bg-gray-100" />
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6 py-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[24px] font-bold text-[#064e3b] mb-2">{t('step1Title')}</h2>
              <p className="text-[14px] text-gray-600">{t('step1Description')}</p>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('firstName')}
              </label>
              <Input
                value={clientInfo.firstName}
                onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                placeholder={t('firstNamePlaceholder')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('lastName')}
              </label>
              <Input
                value={clientInfo.lastName}
                onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                placeholder={t('lastNamePlaceholder')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('phoneNumber')}
              </label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  placeholder={t('phonePlaceholder')}
                  className={`pl-14 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  placeholder={t('emailPlaceholder')}
                  className={`pl-14 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mission Address — Change 6: with autocomplete */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-gray-500 tracking-wide uppercase">
                  {t('missionAddress')}
                </label>
                <button
                  onClick={handleLocateMe}
                  className="flex items-center gap-2 bg-[#a3e635] text-[#1e4620] px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide hover:bg-[#bdf05d] transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  {t('locateMe')}
                </button>
              </div>
              <AddressAutocomplete
                value={clientInfo.address}
                onChange={(addr) => setClientInfo({ ...clientInfo, address: addr })}
                placeholder={t('searchAddress')}
                noResultsText={t('noResults')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Appointment Time — Change 8: split date + time */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('appointmentTime')} *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 mb-1">
                    {t('date')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input
                      type="date"
                      value={clientInfo.appointmentDate}
                      onChange={(e) => setClientInfo({ ...clientInfo, appointmentDate: e.target.value })}
                      className={`pl-11 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.appointmentDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.appointmentDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.appointmentDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-400 mb-1">
                    {t('time')}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <Input
                      type="time"
                      value={clientInfo.appointmentTime}
                      onChange={(e) => setClientInfo({ ...clientInfo, appointmentTime: e.target.value })}
                      className={`pl-11 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.appointmentTime ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.appointmentTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.appointmentTime}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <Button onClick={handleNextStep} className="w-full">
                <span className="text-[15px] font-bold uppercase tracking-wide">{t('nextStep')}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[24px] font-bold text-[#064e3b] mb-2">{t('step2Title')}</h2>
              <p className="text-[14px] text-gray-600">{t('step2Description')}</p>
            </div>

            {/* Mission Type */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('missionType')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMissionDetails({ ...missionDetails, missionType: 'roof' })}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    missionDetails.missionType === 'roof'
                      ? 'border-[#a3e635] bg-[#a3e635]/10'
                      : 'border-gray-200 bg-[#f8fafc]'
                  }`}
                >
                  <Home className="w-6 h-6 text-[#a3e635] mb-2" />
                  <div className="text-[14px] font-bold text-gray-900">{t('roof')}</div>
                </button>
                <button
                  disabled
                  className="p-4 rounded-xl border-2 border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed text-left relative"
                >
                  <div className="absolute top-2 right-2 bg-gray-500 text-white text-[8px] px-2 py-1 rounded-full font-bold">
                    {t('comingSoon')}
                  </div>
                  <FileText className="w-6 h-6 text-gray-400 mb-2" />
                  <div className="text-[14px] font-bold text-gray-500">{t('industrialCleaning')}</div>
                </button>
              </div>
            </div>

            {/* Mission Sub-type */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('missionSubtype')} *
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] cursor-pointer hover:bg-gray-100 transition-all">
                  <Checkbox
                    checked={missionDetails.subTypes.cleaning}
                    onCheckedChange={(checked) =>
                      setMissionDetails({
                        ...missionDetails,
                        subTypes: { ...missionDetails.subTypes, cleaning: checked as boolean },
                      })
                    }
                  />
                  <span className="text-[14px] font-medium text-gray-900">{t('cleaning')}</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl bg-[#f8fafc] cursor-pointer hover:bg-gray-100 transition-all">
                  <Checkbox
                    checked={missionDetails.subTypes.coating}
                    onCheckedChange={(checked) =>
                      setMissionDetails({
                        ...missionDetails,
                        subTypes: { ...missionDetails.subTypes, coating: checked as boolean },
                      })
                    }
                  />
                  <span className="text-[14px] font-medium text-gray-900">{t('coating')}</span>
                </label>
              </div>
              {errors.subTypes && (
                <p className="text-red-500 text-xs mt-2">{errors.subTypes}</p>
              )}
            </div>

            {/* Site Measurements */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('siteMeasurements')}
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">
                    {t('surfaceArea')} *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={missionDetails.surfaceArea}
                      onChange={(e) =>
                        setMissionDetails({ ...missionDetails, surfaceArea: e.target.value })
                      }
                      placeholder="0.00"
                      className={`pr-12 ${errors.surfaceArea ? 'border-red-500' : ''}`}
                    />
                    <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                      m²
                    </span>
                  </div>
                  {errors.surfaceArea && (
                    <p className="text-red-500 text-xs mt-1">{errors.surfaceArea}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                    {t('facadeNumber')} *
                  </label>
                  <p className="text-[11px] text-gray-500 mb-3">{t('facadeHelp')}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {['1', '2', '3', '4'].map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() =>
                          setMissionDetails({ ...missionDetails, facadeNumber: number })
                        }
                        className={`h-14 rounded-xl font-bold text-lg transition-all ${
                          missionDetails.facadeNumber === number
                            ? 'bg-[#a3e635] text-[#064e3b] border-2 border-[#a3e635]'
                            : 'bg-[#f8fafc] text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('propertyFeatures')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'frontParking', label: t('frontParking') },
                  { key: 'garden', label: t('garden') },
                  { key: 'balcony', label: t('balcony') },
                  { key: 'terrace', label: t('terrace') },
                  { key: 'veranda', label: t('veranda') },
                  { key: 'swimmingPool', label: t('swimmingPool') },
                  { key: 'greenhouse', label: t('greenhouse') },
                  { key: 'pergola', label: t('pergola') },
                  { key: 'awning', label: t('awning') },
                  { key: 'solarPanels', label: t('solarPanels') },
                ].map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-2 p-3 rounded-xl bg-[#f8fafc] cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <Checkbox
                      checked={missionDetails.features[feature.key as keyof typeof missionDetails.features]}
                      onCheckedChange={(checked) =>
                        setMissionDetails({
                          ...missionDetails,
                          features: {
                            ...missionDetails.features,
                            [feature.key]: checked as boolean,
                          },
                        })
                      }
                    />
                    <span className="text-[12px] font-medium text-gray-900">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('additionalInformation')}
              </label>
              <textarea
                value={missionDetails.additionalInformation}
                onChange={(e) => setMissionDetails({ ...missionDetails, additionalInformation: e.target.value })}
                placeholder={t('additionalInformationPlaceholder')}
                className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all text-base min-h-[120px] resize-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">{t('optionalField')}</p>
            </div>

            {/* Back Link */}
            <button
              onClick={handlePrevious}
              className="w-full text-[13px] font-bold text-gray-500 hover:text-[#064e3b] transition-colors mb-4"
            >
              {t('previous')}
            </button>

            {/* Next Step Button */}
            <div className="pt-2">
              <Button onClick={handleNextStep} className="w-full">
                <span className="text-[15px] font-bold uppercase tracking-wide">{t('nextStep')}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[24px] font-bold text-[#064e3b] mb-2">{t('step3Title')}</h2>
              <p className="text-[14px] text-gray-600">{t('step3Description')}</p>
            </div>

            {/* Worker Selection */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('selectWorkers')} *
              </label>
              <p className="text-[11px] text-gray-500 mb-3">
                {t('selectWorkersHelp')} ({selectedWorkers.length} {t('selected')})
              </p>
              
              {/* Loading State */}
              {workersLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#064e3b]" />
                  <span className="ml-2 text-[13px] text-gray-500">{t('loadingWorkers')}</span>
                </div>
              )}

              {/* Empty State */}
              {!workersLoading && (!workers || workers.length === 0) && (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-[14px] text-gray-500">{t('noWorkersAvailable')}</p>
                </div>
              )}

              {/* Workers List */}
              {!workersLoading && workers && workers.length > 0 && (
                <div className="space-y-3">
                  {workers.map((worker) => {
                    const isSelected = selectedWorkers.includes(worker.id);
                    return (
                      <button
                        key={worker.id}
                        type="button"
                        onClick={() => toggleWorkerSelection(worker.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-[#a3e635] bg-[#a3e635]/10'
                            : 'border-gray-200 bg-[#f8fafc] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden ${
                            isSelected
                              ? 'bg-[#a3e635] text-[#064e3b]'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {worker.profile_picture_url ? (
                              <img src={worker.profile_picture_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              `${worker.first_name[0]}${worker.last_name[0]}`
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-[15px] font-bold text-gray-900">
                              {worker.first_name} {worker.last_name}
                            </h3>
                            <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
                              {worker.role}
                            </p>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="w-6 h-6 text-[#a3e635]" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {errors.worker && (
                <div className="mt-3 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 font-bold text-lg">!</span>
                  </div>
                  <p className="text-red-700 text-[14px] font-bold">{errors.worker}</p>
                </div>
              )}
            </div>

            {/* Mission Summary */}
            <div className="bg-[#f8fafc] rounded-2xl p-5">
              <h3 className="text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('missionSummary')}
              </h3>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('clientName')}:</span>
                  <span className="font-bold text-gray-900">{clientInfo.firstName} {clientInfo.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('missionType')}:</span>
                  <span className="font-bold text-gray-900">{t('roof')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('surfaceArea')}:</span>
                  <span className="font-bold text-gray-900">{missionDetails.surfaceArea} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('facadeNumber')}:</span>
                  <span className="font-bold text-gray-900">{missionDetails.facadeNumber}</span>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <button
              onClick={handlePrevious}
              className="w-full text-[13px] font-bold text-gray-500 hover:text-[#064e3b] transition-colors mb-4"
            >
              {t('previous')}
            </button>

            {/* Create Mission Button */}
            <div className="pt-2">
              <Button
                onClick={handleCreateMission}
                disabled={createMission.isPending || selectedWorkers.length === 0}
                className="w-full"
              >
                {createMission.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <span className="text-[15px] font-bold uppercase tracking-wide">
                  {createMission.isPending ? t('creating') : t('createMission')}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
