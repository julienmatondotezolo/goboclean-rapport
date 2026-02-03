'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportFormSchema, type ReportForm } from '@/types/report';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Step components
import { ClientInfoStep } from './client-info-step';
import { RoofStateStep } from './roof-state-step';
import { PhotosStep } from './photos-step';
import { CommentsStep } from './comments-step';
import { SignaturesStep } from './signatures-step';

interface ReportFormProps {
  onSubmit: (data: ReportFormData) => Promise<void>;
  initialData?: Partial<ReportFormData>;
  isLoading?: boolean;
}

export interface ReportFormData extends ReportForm {
  before_photos: File[];
  after_photos: File[];
  worker_signature?: string;
  worker_signature_date?: string;
  client_signature?: string;
  client_signature_date?: string;
}

const STEPS = [
  { id: 1, name: 'Informations Client', required: true },
  { id: 2, name: 'État de la Toiture', required: true },
  { id: 3, name: 'Photos', required: true },
  { id: 4, name: 'Commentaires', required: false },
  { id: 5, name: 'Signatures', required: true },
];

export function ReportForm({ onSubmit, initialData, isLoading = false }: ReportFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const [workerSignature, setWorkerSignature] = useState<string | null>(null);
  const [workerSignatureDate, setWorkerSignatureDate] = useState<string | null>(null);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [clientSignatureDate, setClientSignatureDate] = useState<string | null>(null);

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: initialData || {
      client_first_name: '',
      client_last_name: '',
      client_address: '',
      client_phone: '',
      client_latitude: null,
      client_longitude: null,
      roof_type: 'terracotta',
      roof_surface: 0,
      moss_level: 'medium',
      comments: '',
    },
  });

  const progress = (currentStep / STEPS.length) * 100;

  const canGoNext = () => {
    if (currentStep === 1) {
      const values = form.getValues();
      return !!(
        values.client_first_name &&
        values.client_last_name &&
        values.client_address &&
        values.client_phone
      );
    }
    if (currentStep === 2) {
      const values = form.getValues();
      return !!(values.roof_type && values.roof_surface > 0 && values.moss_level);
    }
    if (currentStep === 3) {
      return beforePhotos.length >= 2 && afterPhotos.length >= 2;
    }
    if (currentStep === 4) {
      return true; // Comments are optional
    }
    if (currentStep === 5) {
      return !!(workerSignature && clientSignature);
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const values = form.getValues();
    
    const formData: ReportFormData = {
      ...values,
      before_photos: beforePhotos,
      after_photos: afterPhotos,
      worker_signature: workerSignature || undefined,
      worker_signature_date: workerSignatureDate || undefined,
      client_signature: clientSignature || undefined,
      client_signature_date: clientSignatureDate || undefined,
    };

    await onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Étape {currentStep} sur {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex flex-col items-center gap-2 flex-1',
              currentStep === step.id && 'font-bold'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                currentStep > step.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              )}
            >
              {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <span className="text-xs text-center hidden md:block">{step.name}</span>
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {currentStep === 1 && <ClientInfoStep form={form} />}
          {currentStep === 2 && <RoofStateStep form={form} />}
          {currentStep === 3 && (
            <PhotosStep
              beforePhotos={beforePhotos}
              afterPhotos={afterPhotos}
              onBeforePhotosChange={setBeforePhotos}
              onAfterPhotosChange={setAfterPhotos}
            />
          )}
          {currentStep === 4 && <CommentsStep form={form} />}
          {currentStep === 5 && (
            <SignaturesStep
              workerSignature={workerSignature}
              clientSignature={clientSignature}
              onWorkerSignature={(signature, date) => {
                setWorkerSignature(signature);
                setWorkerSignatureDate(date);
              }}
              onClientSignature={(signature, date) => {
                setClientSignature(signature);
                setClientSignatureDate(date);
              }}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext() || isLoading}
                className="flex-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!canGoNext() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Envoi en cours...' : 'Finaliser le rapport'}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
