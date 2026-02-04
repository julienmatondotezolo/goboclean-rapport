'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, User, Calendar, FileText, Home, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface ClientInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  appointmentTime: string;
  description: string;
}

interface MissionDetails {
  missionType: 'roof' | 'industrial';
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

export default function MissionCreatePage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('MissionCreate');
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    appointmentTime: '',
    description: '',
  });

  const [missionDetails, setMissionDetails] = useState<MissionDetails>({
    missionType: 'roof',
    subTypes: {
      cleaning: false,
      coating: false,
    },
    surfaceArea: '0.00',
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
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
        
        // In a real app, you'd reverse geocode the coordinates to get an address
        const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
        setClientInfo({ ...clientInfo, address: coords });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    }
  };

  const handleCreateMission = async () => {
    setIsCreating(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // In a real app, save to database here
    console.log('Mission created:', { clientInfo, missionDetails });
    
    // Redirect to missions list or dashboard
    router.push(`/${params.locale}/schedule`);
  };

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      <PageHeader title={t('title')} />

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 1
                  ? 'bg-[#a3e635] text-[#1e4620]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wide">
              {t('step')} 1
            </span>
          </div>
          
          <div className={`h-1 flex-1 mx-2 rounded ${currentStep >= 2 ? 'bg-[#a3e635]' : 'bg-gray-200'}`} />
          
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= 2
                  ? 'bg-[#a3e635] text-[#1e4620]'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
            <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wide">
              {t('step')} 2
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-6 py-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Step Title */}
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

            {/* Mission Address */}
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
              <Input
                value={clientInfo.address}
                onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                placeholder={t('addressPlaceholder')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Appointment Time */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('appointmentTime')}
              </label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="datetime-local"
                  value={clientInfo.appointmentTime}
                  onChange={(e) => setClientInfo({ ...clientInfo, appointmentTime: e.target.value })}
                  className="pl-14"
                />
              </div>
            </div>

            {/* Mission Description */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2 tracking-wide uppercase">
                {t('missionDescription')}
              </label>
              <textarea
                value={clientInfo.description}
                onChange={(e) => setClientInfo({ ...clientInfo, description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
                className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#84cc16] focus:ring-2 focus:ring-[#84cc16]/20 transition-all text-base min-h-[120px] resize-none"
              />
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <Button onClick={handleNextStep} className="w-full">
                <span className="text-[15px] font-bold uppercase tracking-wide">{t('nextStep')}</span>
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Step Title */}
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
                {t('missionSubtype')}
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
            </div>

            {/* Site Measurements */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-3 tracking-wide uppercase">
                {t('siteMeasurements')}
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">
                    {t('surfaceArea')}
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={missionDetails.surfaceArea}
                      onChange={(e) =>
                        setMissionDetails({ ...missionDetails, surfaceArea: e.target.value })
                      }
                      className="pr-12"
                    />
                    <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                      m²
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-700 mb-2">
                    {t('facadeNumber')}
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">{t('facadeHelp')}</p>
                  <Input
                    type="number"
                    min="1"
                    value={missionDetails.facadeNumber}
                    onChange={(e) =>
                      setMissionDetails({ ...missionDetails, facadeNumber: e.target.value })
                    }
                  />
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="flex-1"
              >
                <span className="text-[15px] font-bold uppercase tracking-wide">{t('previous')}</span>
              </Button>
              <Button
                onClick={handleCreateMission}
                disabled={isCreating}
                className="flex-1"
              >
                <span className="text-[15px] font-bold uppercase tracking-wide">
                  {isCreating ? t('creating') : t('createMission')}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
