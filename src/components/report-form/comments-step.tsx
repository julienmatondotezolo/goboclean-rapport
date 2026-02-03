'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ReportForm } from '@/types/report';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CommentsStepProps {
  form: UseFormReturn<ReportForm>;
}

export function CommentsStep({ form }: CommentsStepProps) {
  const { register, watch } = form;
  const comments = watch('comments');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Commentaires</h2>
        <p className="text-gray-600">
          Ajoutez des observations techniques ou des remarques (optionnel)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Observations techniques</Label>
        <Textarea
          id="comments"
          {...register('comments')}
          placeholder="Exemple: Présence de tuiles cassées, gouttières à vérifier, etc."
          rows={8}
          className="resize-none"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>Ce champ est optionnel</span>
          <span>{comments?.length || 0} caractères</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">💡 Suggestions</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
          <li>État général de la toiture</li>
          <li>Tuiles endommagées ou manquantes</li>
          <li>Problèmes détectés (gouttières, cheminée, etc.)</li>
          <li>Recommandations pour le client</li>
          <li>Zones nécessitant une attention particulière</li>
        </ul>
      </div>
    </div>
  );
}
