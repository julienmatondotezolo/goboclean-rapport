'use client';

import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eraser, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  title: string;
  description?: string;
  onSave: (dataUrl: string, timestamp: string) => void;
  value?: string | null;
  disabled?: boolean;
  className?: string;
}

export function SignaturePad({
  title,
  description,
  onSave,
  value,
  disabled = false,
  className,
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSaved, setIsSaved] = useState(!!value);

  useEffect(() => {
    if (value && sigCanvas.current) {
      sigCanvas.current.fromDataURL(value);
      setIsEmpty(false);
      setIsSaved(true);
    }
  }, [value]);

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsEmpty(true);
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    if (sigCanvas.current && !isEmpty) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      const timestamp = new Date().toISOString();
      onSave(dataUrl, timestamp);
      setIsSaved(true);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
    setIsSaved(false);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            'border-2 rounded-lg overflow-hidden bg-white',
            isSaved ? 'border-green-500' : 'border-gray-300',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full h-48 touch-none',
              style: { touchAction: 'none' },
            }}
            backgroundColor="white"
            penColor="black"
            onBegin={handleBegin}
            dotSize={1}
            minWidth={0.5}
            maxWidth={2.5}
            velocityFilterWeight={0.7}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isEmpty || disabled}
            className="flex-1"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Effacer
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isEmpty || isSaved || disabled}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {isSaved ? 'Sauvegardée' : 'Sauvegarder'}
          </Button>
        </div>

        {isSaved && (
          <div className="text-sm text-green-600 text-center">
            ✓ Signature enregistrée
          </div>
        )}
      </CardContent>
    </Card>
  );
}
