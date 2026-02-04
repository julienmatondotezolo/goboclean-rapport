'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Camera, Upload, X, ArrowRight, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

const STEPS = {
  PHOTOS: 1,
  CONFIRMATION: 2,
};

const TOTAL_STEPS = 2;

export default function BeforePicturesPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('BeforePictures');
  const id = params.id as string;

  const [currentStep, setCurrentStep] = useState(STEPS.PHOTOS);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Create preview URLs for selected images
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (currentStep === STEPS.PHOTOS && photos.length > 0) {
      setCurrentStep(STEPS.CONFIRMATION);
    }
  };

  const handleConfirmMission = () => {
    // Navigate to the mission detail or report creation page
    router.push(`/${params.locale}/mission/${id}`);
  };

  const canProceed = photos.length > 0;

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      {/* Page Header */}
      <PageHeader title={t('title')} onBack={() => router.push(`/${params.locale}/mission/${id}`)} />

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

      {/* Step 1: Take Photos */}
      {currentStep === STEPS.PHOTOS && (
        <div className="px-6 py-6 space-y-6">
          {/* Instructions */}
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <h2 className="text-[15px] font-bold text-gray-900 mb-2">{t('step1Title')}</h2>
            <p className="text-[13px] text-gray-600 leading-relaxed">{t('step1Description')}</p>
          </div>

          {/* Photo Upload Buttons */}
          <div className="space-y-3">
            <input
              type="file"
              id="camera-input"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <input
              type="file"
              id="gallery-input"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {/* Camera Button */}
            <button
              onClick={() => document.getElementById('camera-input')?.click()}
              disabled={isUploading}
              className="w-full bg-[#064e3b] rounded-2xl p-6 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 bg-[#a3e635] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-7 h-7 text-[#064e3b]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-[15px] font-bold text-white mb-1">{t('takePhoto')}</h3>
                <p className="text-[12px] text-gray-300">{t('useCamera')}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-[#a3e635] flex-shrink-0" />
            </button>

            {/* Gallery Button */}
            <button
              onClick={() => document.getElementById('gallery-input')?.click()}
              disabled={isUploading}
              className="w-full bg-[#f8fafc] rounded-2xl p-6 flex items-center gap-4 border-2 border-gray-100 hover:border-[#a3e635]/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-gray-100">
                <Upload className="w-7 h-7 text-[#064e3b]" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">{t('chooseFromGallery')}</h3>
                <p className="text-[12px] text-gray-500">{t('selectExisting')}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
            </button>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
                  {t('photosTaken')} ({photos.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50"
                  >
                    <Image
                      src={preview}
                      alt={`${t('photo')} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded-lg">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Step Button */}
          <div className="pt-4">
            <Button
              onClick={handleNextStep}
              disabled={!canProceed || isUploading}
              className="w-full"
            >
              <span className="text-[15px] font-bold uppercase tracking-wide">{t('nextStep')}</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {currentStep === STEPS.CONFIRMATION && (
        <div className="px-6 py-6 space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-[#a3e635] to-[#84cc16] rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-500">
            <CheckCircle className="w-14 h-14 text-[#064e3b]" />
          </div>

          {/* Message */}
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-[24px] font-bold text-gray-900">{t('step2Title')}</h2>
            <p className="text-[15px] text-gray-600 leading-relaxed max-w-md">
              {t('step2Description')}
            </p>
          </div>

          {/* Motivation Message */}
          <div className="bg-gradient-to-br from-[#064e3b] to-[#065f46] rounded-2xl p-6 text-center shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
            <p className="text-[16px] font-bold text-white leading-relaxed">
              {t('motivationMessage')}
            </p>
          </div>

          {/* Photo Count Badge */}
          <div className="bg-[#f8fafc] rounded-2xl px-6 py-3 animate-in fade-in duration-700 delay-600">
            <p className="text-[13px] text-gray-600">
              <span className="font-bold text-[#064e3b]">{photos.length}</span> {t('photosAdded')}
            </p>
          </div>

          {/* Confirm Button */}
          <div className="w-full pt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700">
            <Button onClick={handleConfirmMission} className="w-full">
              <CheckCircle className="w-5 h-5" />
              <span className="text-[15px] font-bold uppercase tracking-wide">{t('confirmButton')}</span>
            </Button>
          </div>

          {/* Back Link */}
          <button
            onClick={() => setCurrentStep(STEPS.PHOTOS)}
            className="text-[13px] font-bold text-gray-500 hover:text-[#064e3b] transition-colors animate-in fade-in duration-700 delay-900"
          >
            {t('backToPhotos')}
          </button>
        </div>
      )}
    </div>
  );
}
