'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, SprayCan, Droplets, Paintbrush } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { handleError, showSuccess } from '@/lib/error-handler';

interface StockItem {
  id: string;
  label: string;
  category: string;
  quantity: number;
  threshold: number;
  unit: string;
  low: boolean;
}

const PAINT_COLORS: Record<string, string> = {
  peinture_gris_ardoise: '#64748b',
  peinture_noir: '#111827',
  peinture_rouge: '#dc2626',
  peinture_rouge_sombre: '#7f1d1d',
};

function ProductIcon({ id, className = 'w-4 h-4' }: { id: string; className?: string }) {
  if (id === 'anti_mousse') return <SprayCan className={`${className} text-[#064e3b]`} />;
  if (id === 'hydrofuge') return <Droplets className={`${className} text-sky-600`} />;
  const color = PAINT_COLORS[id];
  if (color) return <Paintbrush className={className} style={{ color }} />;
  return null;
}

export default function StockPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { isAdmin, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const L = (fr: string, nl: string, en: string) => (locale === 'fr' ? fr : locale === 'nl' ? nl : en);

  const { data: items, isLoading } = useQuery<StockItem[]>({
    queryKey: ['stock'],
    queryFn: () => apiClient.get<StockItem[]>('/stock'),
    enabled: isAuthenticated,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [units, setUnits] = useState('1');

  const consume = useMutation({
    mutationFn: () =>
      apiClient.post('/stock/consume', { item_id: selected, units: parseFloat(units) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showSuccess(L('Consommation enregistrée', 'Verbruik geregistreerd', 'Consumption recorded'));
      setSelected(null);
      setUnits('1');
    },
    onError: (e) => handleError(e, { title: L('Erreur stock', 'Stockfout', 'Stock error') }),
  });

  const restock = useMutation({
    mutationFn: ({ id, n }: { id: string; n: number }) =>
      apiClient.post('/stock/restock', { item_id: id, units: n }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showSuccess(L('Stock réapprovisionné', 'Stock aangevuld', 'Restocked'));
    },
    onError: (e) => handleError(e, { title: L('Erreur stock', 'Stockfout', 'Stock error') }),
  });

  return (
    <div className="min-h-screen bg-white pb-28">
      <PageHeader title="Stock" onBack={() => router.push(`/${locale}/dashboard`)} />

      <div className="px-6 space-y-5 pt-4">
        {/* Déclarer une consommation */}
        <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
            {L('Indiquer un produit utilisé', 'Gebruikt product melden', 'Report product used')}
          </div>
          <p className="text-[12px] text-gray-500">
            {L(
              'À chaque fin de chantier, indique les produits utilisés — ils sont déduits du stock.',
              'Meld op het einde van elke werf de gebruikte producten — ze worden afgetrokken van de stock.',
              'At the end of each site, report the products used — they are deducted from stock.',
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {(items ?? []).map((i) => (
              <button
                key={i.id}
                onClick={() => setSelected(selected === i.id ? null : i.id)}
                className={`px-3 py-2 rounded-lg text-[13px] font-bold border-2 transition-all ${
                  selected === i.id
                    ? 'bg-[#064e3b] text-white border-[#064e3b]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <ProductIcon id={i.id} />
                  {i.label}
                </span>
              </button>
            ))}
          </div>
          {selected && (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-24 p-3 rounded-xl border-2 border-gray-200 text-[14px] text-right bg-white text-gray-900"
              />
              <Button
                onClick={() => consume.mutate()}
                disabled={consume.isPending || !parseFloat(units)}
                className="flex-1"
              >
                {consume.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span className="text-[13px] font-bold uppercase">
                  {L('Enregistrer la consommation', 'Verbruik opslaan', 'Record consumption')}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* État du stock */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
            {L('État du stock actuel', 'Huidige stock', 'Current stock')}
          </div>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" />}
          {(items ?? []).map((i) => (
            <div
              key={i.id}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                i.low ? 'bg-red-50 border-red-200' : 'bg-[#f8fafc] border-transparent'
              }`}
            >
              <div>
                <p className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5">
                  <ProductIcon id={i.id} />
                  {i.label}{' '}
                  {i.low && (
                    <span className="text-[10px] font-bold text-red-600 uppercase">
                      {L('faible', 'laag', 'low')}
                    </span>
                  )}
                </p>
                <p className="text-[12px] text-gray-500">
                  {Number(i.quantity)} {i.unit} — {L('seuil', 'drempel', 'threshold')} {Number(i.threshold)}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => {
                    const n = parseFloat(prompt(L('Ajouter combien d’unités ?', 'Hoeveel eenheden toevoegen?', 'How many units to add?'), '15') ?? '');
                    if (n > 0) restock.mutate({ id: i.id, n });
                  }}
                  className="px-3 py-2 rounded-lg text-[12px] font-bold bg-[#064e3b] text-white"
                >
                  + {L('Réappro', 'Aanvullen', 'Restock')}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
