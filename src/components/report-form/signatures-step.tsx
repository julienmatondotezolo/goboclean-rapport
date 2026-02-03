'use client';

import React from 'react';
import { SignaturePad } from '@/components/signature-pad';

interface SignaturesStepProps {
  workerSignature: string | null;
  clientSignature: string | null;
  onWorkerSignature: (signature: string, date: string) => void;
  onClientSignature: (signature: string, date: string) => void;
}

export function SignaturesStep({
  workerSignature,
  clientSignature,
  onWorkerSignature,
  onClientSignature,
}: SignaturesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Signatures</h2>
        <p className="text-gray-600">
          Les deux signatures sont requises pour finaliser le rapport
        </p>
      </div>

      <SignaturePad
        title="Signature de l'ouvrier"
        description="Signez pour certifier l'exécution des travaux"
        onSave={onWorkerSignature}
        value={workerSignature}
      />

      <SignaturePad
        title="Signature du client"
        description="Signature du client pour validation et bon pour accord"
        onSave={onClientSignature}
        value={clientSignature}
      />

      {workerSignature && clientSignature ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✓ Signatures complètes</h3>
          <p className="text-sm text-green-700">
            Les deux signatures ont été enregistrées. Vous pouvez maintenant finaliser le rapport.
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Signatures manquantes</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!workerSignature && <li>• Signature de l'ouvrier requise</li>}
            {!clientSignature && <li>• Signature du client requise</li>}
          </ul>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">📋 Bon pour accord</h3>
        <p className="text-sm text-gray-700">
          En signant ce rapport, le client certifie avoir pris connaissance des travaux effectués
          et accepte la prestation réalisée. Un PDF du rapport lui sera envoyé par email.
        </p>
      </div>
    </div>
  );
}
