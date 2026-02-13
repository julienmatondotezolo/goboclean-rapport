'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Camera, X, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { useCompleteMission, useMission } from '@/hooks/useMissions';
import { showSuccess, handleError } from '@/lib/error-handler';

const STEPS = {
  PHOTOS: 1,
  CONFIRMATION: 2,
  SIGNATURE: 3,
};

const TOTAL_STEPS = 3;
const REQUIRED_PHOTOS = 4;

export default function AfterPicturesPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('AfterPictures');
  const id = params.id as string;
  const locale = params.locale as string;

  const { data: mission } = useMission(id);
  const completeMutation = useCompleteMission();

  const [currentStep, setCurrentStep] = useState(STEPS.PHOTOS);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [workerSignature, setWorkerSignature] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [isWorkerCanvasEmpty, setIsWorkerCanvasEmpty] = useState(true);
  const [isClientCanvasEmpty, setIsClientCanvasEmpty] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const workerCanvasRef = useRef<HTMLCanvasElement>(null);
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      
      const targetIndex = currentPhotoIndex !== null 
        ? currentPhotoIndex 
        : photos.findIndex(p => p === null);
      
      if (targetIndex !== -1) {
        setPhotos((prev) => {
          const newPhotos = [...prev];
          newPhotos[targetIndex] = preview;
          return newPhotos;
        });
        setPhotoFiles((prev) => {
          const newFiles = [...prev];
          newFiles[targetIndex] = file;
          return newFiles;
        });
      }
      
      setCurrentPhotoIndex(null);
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
      setPhotoFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = null;
        return newFiles;
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
    } else if (currentStep === STEPS.CONFIRMATION) {
      setCurrentStep(STEPS.SIGNATURE);
    }
  };

  const handleCompleteMission = async () => {
    // Build FormData with photos + signatures
    const formData = new FormData();
    photoFiles.forEach((file, index) => {
      if (file) {
        formData.append('photos', file, `after-${index + 1}.jpg`);
      }
    });

    if (workerSignature) {
      // Convert data URL to blob
      const workerBlob = await (await fetch(workerSignature)).blob();
      formData.append('worker_signature', workerBlob, 'worker-signature.png');
    }

    if (clientSignature) {
      const clientBlob = await (await fetch(clientSignature)).blob();
      formData.append('client_signature', clientBlob, 'client-signature.png');
    }

    try {
      await completeMutation.mutateAsync({
        id,
        formData,
        onProgress: (pct) => setUploadProgress(pct),
      });
      showSuccess(t('uploadSuccess'));
      router.push(`/${locale}/reports`);
    } catch (error) {
      handleError(error, { title: t('uploadFailed') });
    }
  };

  const photoCount = photos.filter(p => p !== null).length;
  const canProceed = photoCount >= REQUIRED_PHOTOS;
  const remainingPhotos = Math.max(0, REQUIRED_PHOTOS - photoCount);
  const canComplete = workerSignature !== null && clientSignature !== null;

  // Initialize canvas on mount
  useEffect(() => {
    if (currentStep === STEPS.SIGNATURE) {
      const initCanvas = (canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      };

      if (workerCanvasRef.current && !workerSignature) {
        initCanvas(workerCanvasRef.current);
      }
      if (clientCanvasRef.current && !clientSignature) {
        initCanvas(clientCanvasRef.current);
      }
    }
  }, [currentStep, workerSignature, clientSignature]);

  // Drawing functions
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    type: 'worker' | 'client'
  ) => {
    const canvas = type === 'worker' ? workerCanvasRef.current : clientCanvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = true;
    const coords = getCoordinates(e, canvas);
    lastPosRef.current = coords;
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    type: 'worker' | 'client'
  ) => {
    if (!isDrawingRef.current) return;

    const canvas = type === 'worker' ? workerCanvasRef.current : clientCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPosRef.current = coords;

    if (type === 'worker') {
      setIsWorkerCanvasEmpty(false);
    } else {
      setIsClientCanvasEmpty(false);
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = (type: 'worker' | 'client') => {
    const canvas = type === 'worker' ? workerCanvasRef.current : clientCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (type === 'worker') {
      setIsWorkerCanvasEmpty(true);
    } else {
      setIsClientCanvasEmpty(true);
    }
  };

  const saveSignature = (type: 'worker' | 'client') => {
    const canvas = type === 'worker' ? workerCanvasRef.current : clientCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');

    if (type === 'worker') {
      setWorkerSignature(dataUrl);
    } else {
      setClientSignature(dataUrl);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32 font-sans">
      <PageHeader title={t('title')} onBack={() => router.push(`/${locale}/mission/${id}`)} />

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
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-[#064e3b]" />
                      </div>
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
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-linear-to-br from-[#a3e635] to-[#84cc16] rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in duration-500">
              <CheckCircle className="w-12 h-12 text-[#064e3b]" />
            </div>
          </div>

          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-[20px] font-bold text-gray-900">{t('step2Title')}</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed">
              {t('step2Description')}
            </p>
          </div>

          <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold text-gray-900 uppercase tracking-wide">
                {t('photoSummary')}
              </h3>
              <span className="text-[11px] font-bold text-[#064e3b]">
                {photoCount} {t('photos')}
              </span>
            </div>
            
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
                  <div className="absolute top-1 right-1 w-5 h-5 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-3 h-3 text-[#064e3b]" />
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-linear-to-br from-[#064e3b] to-[#065f46] rounded-2xl p-5 text-center shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <p className="text-[14px] font-bold text-white leading-relaxed">
              {t('motivationMessage')}
            </p>
          </div>

          <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-700">
            <Button onClick={handleNextStep} className="w-full">
              <CheckCircle className="w-5 h-5" />
              <span className="text-[15px] font-bold uppercase tracking-wide">{t('continueToSignature')}</span>
            </Button>

            <button
              onClick={() => setCurrentStep(STEPS.PHOTOS)}
              className="w-full text-[13px] font-bold text-gray-500 hover:text-[#064e3b] transition-colors"
            >
              {t('backToPhotos')}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Signatures */}
      {currentStep === STEPS.SIGNATURE && (
        <div className="px-6 py-6 space-y-6">
          <div className="bg-[#f8fafc] rounded-2xl p-5">
            <h2 className="text-[15px] font-bold text-gray-900 mb-2">{t('step3Title')}</h2>
            <p className="text-[13px] text-gray-600 leading-relaxed">{t('step3Description')}</p>
          </div>

          {/* Job Summary Section */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-linear-to-br from-[#064e3b] to-[#065f46] px-4 py-3">
              <h3 className="text-[13px] font-bold text-white uppercase tracking-wide">
                {t('jobSummary')}
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  {t('jobId')}
                </span>
                <span className="text-[13px] font-bold text-gray-900">#{id.slice(0, 8).toUpperCase()}</span>
              </div>

              {mission && (
                <>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                      {t('roofType')}
                    </span>
                    <span className="text-[13px] font-bold text-gray-900">
                      {mission.mission_subtypes?.join(', ') || 'Roof'}
                    </span>
                  </div>

                  {mission.surface_area && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                        {t('totalArea')}
                      </span>
                      <span className="text-[13px] font-bold text-gray-900">{mission.surface_area} m²</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Worker Signature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
                {t('workerSignature')}
              </h3>
              {workerSignature && (
                <button
                  onClick={() => setWorkerSignature(null)}
                  className="text-[11px] font-bold text-red-500 uppercase tracking-wide hover:text-red-700 transition-colors"
                >
                  {t('clear')}
                </button>
              )}
            </div>
            
            <div className="relative">
              {workerSignature ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-[#a3e635] bg-white">
                  <Image
                    src={workerSignature}
                    alt={t('workerSignature')}
                    width={400}
                    height={150}
                    className="w-full h-[150px] object-contain bg-white"
                    style={{ width: "auto", height: "150px" }}
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-[#064e3b]" />
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50">
                  <canvas
                    ref={workerCanvasRef}
                    className="w-full h-[150px] touch-none bg-white cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onMouseDown={(e) => startDrawing(e, 'worker')}
                    onMouseMove={(e) => draw(e, 'worker')}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => startDrawing(e, 'worker')}
                    onTouchMove={(e) => draw(e, 'worker')}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                      {t('signHere')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!workerSignature && (
              <div className="flex gap-2">
                <button
                  onClick={() => clearCanvas('worker')}
                  className="flex-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t('clear')}
                </button>
                <button
                  onClick={() => saveSignature('worker')}
                  disabled={isWorkerCanvasEmpty}
                  className="flex-1 bg-[#064e3b] text-white text-[11px] font-bold uppercase py-3 px-4 rounded-xl hover:bg-[#065f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('save')}
                </button>
              </div>
            )}
          </div>

          {/* Client Signature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
                {t('clientSignature')}
              </h3>
              {clientSignature && (
                <button
                  onClick={() => setClientSignature(null)}
                  className="text-[11px] font-bold text-red-500 uppercase tracking-wide hover:text-red-700 transition-colors"
                >
                  {t('clear')}
                </button>
              )}
            </div>
            
            <div className="relative">
              {clientSignature ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-[#a3e635] bg-white">
                  <Image
                    src={clientSignature}
                    alt={t('clientSignature')}
                    width={400}
                    height={150}
                    className="w-full h-[150px] object-contain bg-white"
                    style={{ width: "auto", height: "150px" }}
                  />
                  <div className="absolute top-2 right-2 w-7 h-7 bg-[#a3e635] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-[#064e3b]" />
                  </div>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50">
                  <canvas
                    ref={clientCanvasRef}
                    className="w-full h-[150px] touch-none bg-white cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onMouseDown={(e) => startDrawing(e, 'client')}
                    onMouseMove={(e) => draw(e, 'client')}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => startDrawing(e, 'client')}
                    onTouchMove={(e) => draw(e, 'client')}
                    onTouchEnd={stopDrawing}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                      {t('signHere')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!clientSignature && (
              <div className="flex gap-2">
                <button
                  onClick={() => clearCanvas('client')}
                  className="flex-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t('clear')}
                </button>
                <button
                  onClick={() => saveSignature('client')}
                  disabled={isClientCanvasEmpty}
                  className="flex-1 bg-[#064e3b] text-white text-[11px] font-bold uppercase py-3 px-4 rounded-xl hover:bg-[#065f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('save')}
                </button>
              </div>
            )}
          </div>

          {canComplete && (
            <div className="bg-green-50 border-2 border-[#a3e635] rounded-2xl p-4">
              <p className="text-[13px] font-bold text-[#064e3b] text-center">
                ✓ {t('allSignaturesComplete')}
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {completeMutation.isPending && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-[13px] font-bold text-blue-800">
                  {t('uploadProgress', { percent: uploadProgress })}
                </p>
              </div>
              <Progress value={uploadProgress} className="h-2 bg-blue-100" />
            </div>
          )}

          {/* Complete Button */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleCompleteMission}
              disabled={!canComplete || completeMutation.isPending}
              className="w-full"
            >
              {completeMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="text-[15px] font-bold uppercase tracking-wide">
                {completeMutation.isPending ? t('uploading') : t('completeMission')}
              </span>
            </Button>

            <button
              onClick={() => setCurrentStep(STEPS.CONFIRMATION)}
              disabled={completeMutation.isPending}
              className="w-full text-[13px] font-bold text-gray-500 hover:text-[#064e3b] transition-colors disabled:opacity-50"
            >
              {t('backToConfirmation')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
