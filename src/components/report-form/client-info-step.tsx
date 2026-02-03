'use client';

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ReportForm } from '@/types/report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { getCurrentPosition, formatCoordinates } from '@/lib/geolocation';
import { useToast } from '@/components/ui/use-toast';

interface ClientInfoStepProps {
  form: UseFormReturn<ReportForm>;
}

export function ClientInfoStep({ form }: ClientInfoStepProps) {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const { toast } = useToast();
  const { register, setValue, watch, formState: { errors } } = form;

  const latitude = watch('client_latitude');
  const longitude = watch('client_longitude');

  const handleGeolocate = async () => {
    setIsGeolocating(true);
    try {
      const coords = await getCurrentPosition();
      setValue('client_latitude', coords.latitude);
      setValue('client_longitude', coords.longitude);
      
      toast({
        title: 'Position enregistrée',
        description: `Coordonnées: ${formatCoordinates(coords)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de géolocalisation',
        description: error.message || 'Impossible d\'obtenir votre position',
        variant: 'destructive',
      });
    } finally {
      setIsGeolocating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Informations Client</h2>
        <p className="text-gray-600">Renseignez les coordonnées du client</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client_first_name">
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="client_first_name"
            {...register('client_first_name')}
            placeholder="Jean"
            className={errors.client_first_name ? 'border-red-500' : ''}
          />
          {errors.client_first_name && (
            <p className="text-sm text-red-500">{errors.client_first_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_last_name">
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="client_last_name"
            {...register('client_last_name')}
            placeholder="Dupont"
            className={errors.client_last_name ? 'border-red-500' : ''}
          />
          {errors.client_last_name && (
            <p className="text-sm text-red-500">{errors.client_last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client_address">
          Adresse <span className="text-red-500">*</span>
        </Label>
        <Input
          id="client_address"
          {...register('client_address')}
          placeholder="123 Rue de la Toiture, 1000 Bruxelles"
          className={errors.client_address ? 'border-red-500' : ''}
        />
        {errors.client_address && (
          <p className="text-sm text-red-500">{errors.client_address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client_phone">
          Téléphone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="client_phone"
          type="tel"
          {...register('client_phone')}
          placeholder="+32 471 23 45 67"
          className={errors.client_phone ? 'border-red-500' : ''}
        />
        {errors.client_phone && (
          <p className="text-sm text-red-500">{errors.client_phone.message}</p>
        )}
        <p className="text-sm text-gray-500">Format: +32 ou 0 suivi de 8-9 chiffres</p>
      </div>

      <div className="space-y-2">
        <Label>Position GPS (optionnel)</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGeolocate}
            disabled={isGeolocating}
            className="flex-1"
          >
            {isGeolocating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Localisation...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Géolocaliser
              </>
            )}
          </Button>
        </div>
        {latitude && longitude && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
            ✓ Position enregistrée: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
}
