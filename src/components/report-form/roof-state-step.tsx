'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ReportForm, RoofType, MossLevel } from '@/types/report';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RoofStateStepProps {
  form: UseFormReturn<ReportForm>;
}

const ROOF_TYPES = [
  { value: RoofType.SLATE, label: 'Ardoise' },
  { value: RoofType.TERRACOTTA, label: 'Terre cuite' },
  { value: RoofType.CONCRETE, label: 'Béton' },
  { value: RoofType.METAL, label: 'Métal' },
  { value: RoofType.SHINGLE, label: 'Bardeau' },
  { value: RoofType.OTHER, label: 'Autre' },
];

const MOSS_LEVELS = [
  { value: MossLevel.LOW, label: 'Faible', color: 'bg-green-100 text-green-800' },
  { value: MossLevel.MEDIUM, label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  { value: MossLevel.HIGH, label: 'Fort', color: 'bg-red-100 text-red-800' },
];

export function RoofStateStep({ form }: RoofStateStepProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  const roofType = watch('roof_type');
  const mossLevel = watch('moss_level');
  const roofSurface = watch('roof_surface');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">État de la Toiture</h2>
        <p className="text-gray-600">Détails techniques de l'intervention</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roof_type">
          Type de toiture <span className="text-red-500">*</span>
        </Label>
        <Select
          value={roofType}
          onValueChange={(value) => setValue('roof_type', value as any)}
        >
          <SelectTrigger className={errors.roof_type ? 'border-red-500' : ''}>
            <SelectValue placeholder="Sélectionnez le type de tuiles" />
          </SelectTrigger>
          <SelectContent>
            {ROOF_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roof_type && (
          <p className="text-sm text-red-500">{errors.roof_type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="roof_surface">
          Surface estimée (m²) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="roof_surface"
          type="number"
          step="0.1"
          min="0"
          max="10000"
          {...register('roof_surface', { valueAsNumber: true })}
          placeholder="150"
          className={errors.roof_surface ? 'border-red-500' : ''}
        />
        {errors.roof_surface && (
          <p className="text-sm text-red-500">{errors.roof_surface.message}</p>
        )}
        {roofSurface > 0 && (
          <p className="text-sm text-gray-500">
            Surface: {roofSurface} m²
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Niveau de mousse/lichen <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {MOSS_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setValue('moss_level', level.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                mossLevel === level.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${level.color}`}
            >
              <div className="text-center font-medium">{level.label}</div>
            </button>
          ))}
        </div>
        {errors.moss_level && (
          <p className="text-sm text-red-500">{errors.moss_level.message}</p>
        )}
      </div>

      {/* Visual Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Récapitulatif</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">Type:</span>{' '}
            {ROOF_TYPES.find(t => t.value === roofType)?.label || 'Non sélectionné'}
          </li>
          <li>
            <span className="font-medium">Surface:</span>{' '}
            {roofSurface > 0 ? `${roofSurface} m²` : 'Non renseignée'}
          </li>
          <li>
            <span className="font-medium">Niveau de mousse:</span>{' '}
            {MOSS_LEVELS.find(l => l.value === mossLevel)?.label || 'Non sélectionné'}
          </li>
        </ul>
      </div>
    </div>
  );
}
