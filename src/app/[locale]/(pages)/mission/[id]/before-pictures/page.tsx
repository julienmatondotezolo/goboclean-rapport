'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Camera, X, ArrowRight, CheckCircle } from 'lucide-react';
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
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Take only the first file selected
      const file = files[0];
      const preview = URL.createObjectURL(file);
      
      // Find the first empty slot or use the currentPhotoIndex if set
      const targetIndex = currentPhotoIndex !== null 
        ? currentPhotoIndex 
        : photos.findIndex(p => p === null);
      
      if (targetIndex !== -1) {
        setPhotos((prev) => {
          const newPhotos = [...prev];
          newPhotos[targetIndex] = preview;
          return newPhotos;
        });
      }
      
      // Reset current photo index
      setCurrentPhotoIndex(null);
      
      // Reset the file input so the same file can be selected again
      event.target.value = '';
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    if (photos[index]) {
      URL.revokeObjectURL(photos[index]!);
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[index] = null;
        return newPhotos;
      });
    }
  };

  const handleTakePhotoForSlot = (index: number) => {
    setCurrentPhotoIndex(index);
    document.getElementById('camera-input')?.click();
  };

  const handleNextStep = () => {
    if (currentStep === STEPS.PHOTOS && canProceed) {
      setCurrentStep(STEPS.CONFIRMATION);
    }
  };

  const handleConfirmMission = () => {
    // Navigate to the mission detail or report creation page
    router.push(`/${params.locale}/mission/${id}`);
  };

  const photoCount = photos.filter(p => p !== null).length;
  const canProceed = photoCount >= REQUIRED_PHOTOS;
  const remainingPhotos = Math.max(0, REQUIRED_PHOTOS - photoCount);

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
                {photoCount} / {REQUIRED_PHOTOS} {t('photosRequired')}
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
              const getLabel = (idx: number) => {
                switch(idx) {
                  case 0: return t('frontSlope');
                  case 1: return t('valleyDetail');
                  case 2: return t('ridge');
                  case 3: return t('chimney');
                  default: return '';
                }
              };
              
              return (
                <div key={index} className="space-y-2">
                  {/* Label above box */}
                  <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    {getLabel(index)}
                  </div>
                  
                  <div
                    className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50"
                    style={{ aspectRatio: '3/2' }}
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
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-[#064e3b]" />
                      </div>
                      {/* Delete and Retake buttons at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1.5 bg-linear-to-t from-black/80 to-transparent">
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="flex-1 bg-red-500 text-white text-[9px] font-bold uppercase py-1.5 px-1 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          {t('delete')}
                        </button>
                        <button
                          onClick={() => {
                            handleRemovePhoto(index);
                            setTimeout(() => handleTakePhotoForSlot(index), 100);
                          }}
                          className="flex-1 bg-white text-gray-900 text-[9px] font-bold uppercase py-1.5 px-1 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          {t('retake')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleTakePhotoForSlot(index)}
                      disabled={isUploading}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                        <Camera className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide text-center px-2 leading-tight">
                        {t('addPhoto')}
                      </p>
                    </button>
                  )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status Message */}
          {!canProceed && photoCount > 0 && (
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
        <div className="px-6 py-6 space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-linear-to-br from-[#a3e635] to-[#84cc16] rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-[#064e3b]" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-[20px] font-bold text-gray-900">{t('step2Title')}</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              {t('step2Description')}
            </p>
          </div>

          {/* Photo Summary */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">
                {t('photoSummary')}
              </h3>
              <span className="text-[11px] font-bold text-[#064e3b]">
                {photoCount} {t('photos')}
              </span>
            </div>
            
            {/* Photo Grid Summary - Smaller */}
            <div className="grid grid-cols-4 gap-2">
              {photos.filter(p => p !== null).map((photo, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden border-2 border-[#a3e635]/30 bg-white aspect-square"
                >
                  <Image
                    src={photo!}
                    alt={`${t('photo')} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 20vw"
                  />
                  {/* Green checkmark */}
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-3 h-3 text-[#064e3b]" />
                  </div>
                  {/* Photo number badge */}
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motivation Message */}
          <div className="bg-linear-to-br from-[#064e3b] to-[#065f46] rounded-2xl p-5 text-center shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <p className="text-[14px] font-bold text-white leading-relaxed">
              {t('motivationMessage')}
            </p>
          </div>

          {/* Confirm Button */}
          <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-700">
            <Button onClick={handleConfirmMission} className="w-full">
              <CheckCircle className="w-5 h-5" />
              <span className="text-[15px] font-bold uppercase tracking-wide">{t('confirmAndStartButton')}</span>
            </Button>

            {/* Back Link */}
            <button
              onClick={() => setCurrentStep(STEPS.PHOTOS)}
              className="w-full text-[13px] font-bold text-gray-500 hover:text-[#064e3b] transition-colors"
            >
              {t('backToPhotos')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
