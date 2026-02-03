'use client';

import React from 'react';
import { PhotoUploader } from '@/components/photo-uploader';

interface PhotosStepProps {
  beforePhotos: File[];
  afterPhotos: File[];
  onBeforePhotosChange: (photos: File[]) => void;
  onAfterPhotosChange: (photos: File[]) => void;
}

export function PhotosStep({
  beforePhotos,
  afterPhotos,
  onBeforePhotosChange,
  onAfterPhotosChange,
}: PhotosStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Photos de l'intervention</h2>
        <p className="text-gray-600">
          Prenez au minimum 2 photos avant et 2 photos après le nettoyage
        </p>
      </div>

      <PhotoUploader
        title="Photos AVANT"
        description="État de la toiture avant l'intervention"
        photos={beforePhotos}
        onPhotosChange={onBeforePhotosChange}
        minPhotos={2}
        maxPhotos={10}
      />

      <PhotoUploader
        title="Photos APRÈS"
        description="État de la toiture après le nettoyage"
        photos={afterPhotos}
        onPhotosChange={onAfterPhotosChange}
        minPhotos={2}
        maxPhotos={10}
      />

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Récapitulatif</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Photos avant:</span>{' '}
            <span className={beforePhotos.length >= 2 ? 'text-green-600' : 'text-red-600'}>
              {beforePhotos.length} / 2 min
            </span>
          </div>
          <div>
            <span className="font-medium">Photos après:</span>{' '}
            <span className={afterPhotos.length >= 2 ? 'text-green-600' : 'text-red-600'}>
              {afterPhotos.length} / 2 min
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Les photos sont automatiquement compressées pour économiser votre forfait data
        </p>
      </div>
    </div>
  );
}
