'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Minus, Plus, SprayCan, Droplets, Paintbrush } from 'lucide-react';
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

function ProductIcon({ id, className = 'w-5 h-5' }: { id: string; className?: string }) {
  if (id === 'anti_mousse') return <SprayCan className={className} />;
  if (id === 'hydrofuge') return <Droplets className={className} />;
  return <Paintbrush className={className} style={{ color: PAINT_COLORS[id] }} />;
}

/** Libellé court pour les tuiles (les peintures gardent juste leur teinte). */
function shortLabel(item: StockItem): string {
  return item.label.replace('Peinture — ', '');
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
  const [units, setUnits] = useState(1);
  const [restockItem, setRestockItem] = useState<string | null>(null);
  const [restockUnits, setRestockUnits] = useState(15);

  const paints = (items ?? []).filter((i) => i.category === 'peinture');
  const products = (items ?? []).filter((i) => i.category !== 'peinture');

  const consume = useMutation({
    mutationFn: () => apiClient.post('/stock/consume', { item_id: selected, units }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showSuccess(L('Consommation enregistrée', 'Verbruik geregistreerd', 'Consumption recorded'));
      setSelected(null);
      setUnits(1);
    },
    onError: (e) => handleError(e, { title: L('Erreur stock', 'Stockfout', 'Stock error') }),
  });

  const restock = useMutation({
    mutationFn: ({ id, n }: { id: string; n: number }) =>
      apiClient.post('/stock/restock', { item_id: id, units: n }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showSuccess(L('Stock réapprovisionné', 'Stock aangevuld', 'Restocked'));
      setRestockItem(null);
      setRestockUnits(15);
    },
    onError: (e) => handleError(e, { title: L('Erreur stock', 'Stockfout', 'Stock error') }),
  });

  const selectedItem = (items ?? []).find((i) => i.id === selected) ?? null;
  const maxUnits = Number(selectedItem?.quantity ?? 0);

  const tile = (item: StockItem) => {
    const empty = Number(item.quantity) <= 0;
    return (
      <button
        key={item.id}
        disabled={empty}
        onClick={() => {
          setSelected(selected === item.id ? null : item.id);
          setUnits(1);
        }}
        className={`flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border-2 transition-all min-h-[80px] ${
          selected === item.id
            ? 'bg-[#064e3b] text-white border-[#064e3b]'
            : empty
              ? 'bg-gray-50 text-gray-300 border-gray-100'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#064e3b]/40'
        }`}
      >
        <ProductIcon
          id={item.id}
          className={`w-5 h-5 ${selected === item.id ? 'text-white' : empty ? 'opacity-30' : ''}`}
        />
        <span className="text-[12px] font-bold leading-tight text-center">{shortLabel(item)}</span>
        <span
          className={`text-[10px] font-medium ${
            selected === item.id ? 'text-white/70' : empty ? 'text-gray-300' : 'text-gray-400'
          }`}
        >
          {empty
            ? L('épuisé', 'op', 'out of stock')
            : `${Number(item.quantity)} ${L('dispo', 'besch.', 'avail.')}`}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <PageHeader title="Stock" onBack={() => router.push(`/${locale}/dashboard`)} />

      <div className="px-6 space-y-6 pt-4">
        {/* Déclarer une consommation */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-[16px] font-bold text-[#1e293b]">
              {L('Produit utilisé', 'Gebruikt product', 'Product used')}
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {L(
                'En fin de chantier, sélectionne le produit — il est déduit du stock.',
                'Selecteer het product op het einde van de werf — het wordt afgetrokken.',
                'At the end of the site, select the product — it is deducted from stock.',
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">{products.map(tile)}</div>
          <div className="text-[11px] font-bold text-gray-400 tracking-wide uppercase pt-1">
            {L('Peintures', 'Verf', 'Paints')}
          </div>
          <div className="grid grid-cols-2 gap-2">{paints.map(tile)}</div>

          {selected && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between bg-[#f8fafc] rounded-2xl p-3">
                <span className="text-[13px] font-bold text-gray-700">
                  {L('Unités', 'Eenheden', 'Units')}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setUnits(Math.max(1, units - 1))}
                    className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="text-[18px] font-bold text-gray-900 w-8 text-center">{units}</span>
                  <button
                    onClick={() => setUnits(Math.min(maxUnits, units + 1))}
                    disabled={units >= maxUnits}
                    className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>
              <Button onClick={() => consume.mutate()} disabled={consume.isPending} className="w-full">
                {consume.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span className="text-[13px] font-bold uppercase tracking-wide">
                  {L('Enregistrer', 'Opslaan', 'Save')}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* État du stock */}
        <div className="space-y-3">
          <h3 className="text-[16px] font-bold text-[#1e293b] px-1">
            {L('État du stock', 'Stockniveau', 'Stock levels')}
          </h3>
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" />
            </div>
          )}
          {(items ?? []).map((i) => (
            <div key={i.id} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center shrink-0">
                    <ProductIcon id={i.id} className="w-5 h-5 text-[#064e3b]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 truncate">{i.label}</p>
                    <p className="text-[12px] text-gray-500">
                      {L('alerte sous', 'alarm onder', 'alert below')} {Number(i.threshold)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[13px] font-bold ${
                    i.low ? 'bg-red-100 text-red-700' : 'bg-[#a3e635]/20 text-[#064e3b]'
                  }`}
                >
                  {Number(i.quantity)} {L('en stock', 'in voorraad', 'in stock')}
                </span>
              </div>
              {/* Jauge quantité / seuil */}
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${i.low ? 'bg-red-400' : 'bg-[#a3e635]'}`}
                  style={{
                    width: `${Math.min(100, (Number(i.quantity) / (Number(i.threshold) * 2 || 1)) * 100)}%`,
                  }}
                />
              </div>
              {isAdmin && restockItem !== i.id && (
                <button
                  onClick={() => {
                    setRestockItem(i.id);
                    setRestockUnits(15);
                  }}
                  className="w-full py-2 rounded-xl text-[12px] font-bold bg-[#f8fafc] text-[#064e3b] border border-gray-200 hover:border-[#064e3b]/40 transition-all"
                >
                  + {L('Réapprovisionner', 'Aanvullen', 'Restock')}
                </button>
              )}
              {isAdmin && restockItem === i.id && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-[#f8fafc] rounded-xl p-2.5">
                    <span className="text-[12px] font-bold text-gray-700">
                      {L('Unités à ajouter', 'Eenheden toevoegen', 'Units to add')}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setRestockUnits(Math.max(1, restockUnits - 5))}
                        className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="text-[16px] font-bold text-gray-900 w-8 text-center">{restockUnits}</span>
                      <button
                        onClick={() => setRestockUnits(restockUnits + 5)}
                        className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRestockItem(null)}
                      className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-white text-gray-500 border border-gray-200"
                    >
                      {L('Annuler', 'Annuleren', 'Cancel')}
                    </button>
                    <button
                      onClick={() => restock.mutate({ id: i.id, n: restockUnits })}
                      disabled={restock.isPending}
                      className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-[#064e3b] text-white disabled:opacity-50"
                    >
                      {L('Confirmer', 'Bevestigen', 'Confirm')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
