'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { compressImage, isImageFile, validateImageSize } from '@/lib/image-compression';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface PhotoUploaderProps {
  title: string;
  description?: string;
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  minPhotos?: number;
  maxPhotos?: number;
  disabled?: boolean;
  className?: string;
}

export function PhotoUploader({
  title,
  description,
  photos,
  onPhotosChange,
  minPhotos = 2,
  maxPhotos = 10,
  disabled = false,
  className,
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate all files
    const invalidFiles = files.filter(file => !isImageFile(file));
    if (invalidFiles.length > 0) {
      toast({
        title: 'Fichiers invalides',
        description: 'Seules les images sont acceptées',
        variant: 'destructive',
      });
      return;
    }

    const oversizedFiles = files.filter(file => !validateImageSize(file, 10));
    if (oversizedFiles.length > 0) {
      toast({
        title: 'Fichiers trop volumineux',
        description: 'Les images ne doivent pas dépasser 10 MB',
        variant: 'destructive',
      });
      return;
    }

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Trop de photos',
        description: `Vous ne pouvez ajouter que ${maxPhotos} photos maximum`,
        variant: 'destructive',
      });
      return;
    }

    setIsCompressing(true);

    try {
      // Compress images
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      );

      // Create previews
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));

      // Update state
      const updatedPhotos = [...photos, ...compressedFiles];
      const updatedPreviews = [...previews, ...newPreviews];

      onPhotosChange(updatedPhotos);
      setPreviews(updatedPreviews);

      toast({
        title: 'Photos ajoutées',
        description: `${compressedFiles.length} photo(s) compressée(s) et ajoutée(s)`,
      });
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter les images',
        variant: 'destructive',
      });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(previews[index]);

    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    onPhotosChange(updatedPhotos);
    setPreviews(updatedPreviews);

    toast({
      title: 'Photo supprimée',
      description: 'La photo a été retirée',
    });
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isMinimumMet = photos.length >= minPhotos;
  const canAddMore = photos.length < maxPhotos;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className={cn(
            'text-sm font-normal',
            isMinimumMet ? 'text-green-600' : 'text-red-600'
          )}>
            {photos.length} / {minPhotos} min
          </span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Buttons */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || !canAddMore}
          />
          
          <Button
            type="button"
            onClick={handleCameraCapture}
            disabled={disabled || !canAddMore || isCompressing}
            className="flex-1"
            variant="outline"
          >
            {isCompressing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Compression...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Prendre une photo
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }
            }}
            disabled={disabled || !canAddMore || isCompressing}
            className="flex-1"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Galerie
          </Button>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status */}
        {!isMinimumMet && photos.length > 0 && (
          <p className="text-sm text-red-600">
            Vous devez ajouter au moins {minPhotos - photos.length} photo(s) supplémentaire(s)
          </p>
        )}

        {isMinimumMet && (
          <p className="text-sm text-green-600">
            ✓ Nombre minimum de photos atteint
          </p>
        )}
      </CardContent>
    </Card>
  );
}
