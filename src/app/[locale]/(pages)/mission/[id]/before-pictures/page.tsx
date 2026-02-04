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
const REQUIRED_PHOTOS = 4;

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
    if (currentStep === STEPS.PHOTOS && photos.length >= REQUIRED_PHOTOS) {
      setCurrentStep(STEPS.CONFIRMATION);
    }
  };

  const handleConfirmMission = () => {
    // Navigate to the mission detail or report creation page
    router.push(`/${params.locale}/mission/${id}`);
  };

  const canProceed = photos.length >= REQUIRED_PHOTOS;
  const remainingPhotos = Math.max(0, REQUIRED_PHOTOS - photos.length);

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
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[13px] font-bold text-[#064e3b]">
                {photos.length} / {REQUIRED_PHOTOS} {t('photosRequired')}
              </p>
              {remainingPhotos > 0 && (
                <p className="text-[12px] text-gray-500 mt-1">
                  {t('remainingPhotos', { count: remainingPhotos })}
                </p>
              )}
            </div>
          </div>

          {/* Photo Grid - Always show 4 slots */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="file"
              id="camera-input"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {[...Array(REQUIRED_PHOTOS)].map((_, index) => {
              const hasPhoto = photos[index];
              
              return (
                <div
                  key={index}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50"
                >
                  {hasPhoto ? (
                    <>
                      <Image
                        src={hasPhoto}
                        alt={`${t('photo')} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      {/* Green checkmark on top right */}
                      <div className="absolute top-2 right-2 w-7 h-7 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-[#064e3b]" />
                      </div>
                      {/* Delete and Retake buttons at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="flex-1 bg-red-500 text-white text-[10px] font-bold uppercase py-2 px-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          {t('delete')}
                        </button>
                        <button
                          onClick={() => {
                            handleRemovePhoto(index);
                            setTimeout(() => document.getElementById('camera-input')?.click(), 100);
                          }}
                          className="flex-1 bg-white text-gray-900 text-[10px] font-bold uppercase py-2 px-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          {t('retake')}
                        </button>
                      </div>
                      {/* Photo label */}
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] font-bold px-2 py-1 rounded-lg">
                        {index === 0 ? t('frontSlope') : index === 1 ? t('valleyDetail') : index === 2 ? t('ridge') : t('chimney')}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => document.getElementById('camera-input')?.click()}
                      disabled={isUploading}
                      className="w-full h-full flex flex-col items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide text-center px-2">
                        {index === 0 ? t('addFrontSlope') : index === 1 ? t('addValleyDetail') : index === 2 ? t('addRidge') : t('addChimney')}
                      </p>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {!canProceed && photos.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
              <p className="text-[13px] font-bold text-orange-800 text-center">
                {t('needMorePhotos', { count: remainingPhotos })}
              </p>
            </div>
          )}

          {canProceed && (
            <div className="bg-green-50 border-2 border-[#a3e635] rounded-2xl p-4">
              <p className="text-[13px] font-bold text-[#064e3b] text-center">
                ✓ {t('allPhotosComplete')}
              </p>
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
