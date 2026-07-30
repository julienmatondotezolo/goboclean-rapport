'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useWorkersList } from '@/hooks/useWorkers';
import { handleError, showSuccess } from '@/lib/error-handler';

interface WorkDay {
  id: string;
  worker_id: string;
  work_date: string;
  amount: number;
  note: string | null;
  paid: boolean;
}

interface SalaryMonth {
  month: string;
  days: WorkDay[];
  total: number;
  unpaid: number;
  days_worked: number;
}

const AMOUNTS = [100, 150, 200, 250, 300];

function currentMonth(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' }).slice(0, 7);
}

function daysInMonth(m: string): number {
  const [y, mm] = m.split('-').map(Number);
  return new Date(y, mm, 0).getDate();
}

function shiftMonth(m: string, delta: number): string {
  const [y, mm] = m.split('-').map(Number);
  const d = new Date(y, mm - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function SalaryPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const { user, isAdmin, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const L = (fr: string, nl: string, en: string) => (locale === 'fr' ? fr : locale === 'nl' ? nl : en);

  const [month, setMonth] = useState(currentMonth());
  const [workerId, setWorkerId] = useState<string | null>(null);
  const { data: workers } = useWorkersList({ enabled: isAdmin });

  const effectiveWorkerId = isAdmin ? workerId : (user?.id ?? null);

  const { data, isLoading } = useQuery<SalaryMonth>({
    queryKey: ['salary', effectiveWorkerId, month],
    queryFn: () =>
      isAdmin
        ? apiClient.get<SalaryMonth>(`/salary/worker/${effectiveWorkerId}?month=${month}`)
        : apiClient.get<SalaryMonth>(`/salary/me?month=${month}`),
    enabled: isAuthenticated && !!effectiveWorkerId,
  });

  const [newDate, setNewDate] = useState('');
  const [newAmount, setNewAmount] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['salary'] });

  const addDay = useMutation({
    mutationFn: () =>
      apiClient.post('/salary', { worker_id: effectiveWorkerId, work_date: newDate, amount: newAmount }),
    onSuccess: () => {
      invalidate();
      showSuccess(L('Journée enregistrée', 'Dag geregistreerd', 'Day recorded'));
      setNewDate('');
      setNewAmount(null);
    },
    onError: (e) => handleError(e, { title: L('Erreur paie', 'Loonfout', 'Salary error') }),
  });

  const togglePaid = useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      apiClient.patch(`/salary/${id}`, { paid }),
    onSuccess: invalidate,
    onError: (e) => handleError(e, { title: L('Erreur paie', 'Loonfout', 'Salary error') }),
  });

  const payMonth = useMutation({
    mutationFn: () => apiClient.post(`/salary/worker/${effectiveWorkerId}/pay-month?month=${month}`),
    onSuccess: () => {
      invalidate();
      showSuccess(L('Mois marqué payé', 'Maand betaald gemarkeerd', 'Month marked paid'));
    },
    onError: (e) => handleError(e, { title: L('Erreur paie', 'Loonfout', 'Salary error') }),
  });

  const existingDates = new Set((data?.days ?? []).map((d) => d.work_date));
  const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
  const weekdayShort = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: 'short' }).replace('.', '');
  const monthLabel = (() => {
    const label = new Date(`${month}-01T12:00:00`).toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  })();
  const selectedDayLabel = newDate
    ? new Date(`${newDate}T12:00:00`).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null;

  // Présélectionne aujourd'hui (si libre) et centre la bande dessus
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!newDate && month === todayIso.slice(0, 7) && data && !existingDates.has(todayIso)) {
      setNewDate(todayIso);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, month]);
  useEffect(() => {
    const target = stripRef.current?.querySelector('[data-selected="true"], [data-today="true"]');
    if (target) target.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [newDate, month, data]);

  const fmtDay = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: '2-digit' });

  return (
    <div className="min-h-screen bg-white pb-28">
      <PageHeader title={L('Salaire', 'Loon', 'Salary')} onBack={() => router.push(`/${locale}/dashboard`)} />

      <div className="px-6 space-y-5 pt-4">
        {/* Sélecteur ouvrier (admin) */}
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            {(workers ?? []).map((w: any) => (
              <button
                key={w.id}
                onClick={() => setWorkerId(w.id)}
                className={`px-3 py-2 rounded-lg text-[13px] font-bold border-2 transition-all ${
                  workerId === w.id
                    ? 'bg-[#064e3b] text-white border-[#064e3b]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {w.first_name} {w.last_name}
              </button>
            ))}
          </div>
        )}

        {/* Navigation mois + solde */}
        <div className="bg-[#064e3b] rounded-2xl p-5 text-white space-y-2">
          <div className="flex items-center justify-between">
            <button onClick={() => { setMonth(shiftMonth(month, -1)); setNewDate(''); }} className="p-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[14px] font-bold uppercase tracking-wide">{monthLabel}</span>
            <button onClick={() => { setMonth(shiftMonth(month, 1)); setNewDate(''); }} className="p-1">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {effectiveWorkerId ? (
            <>
              <p className="text-[30px] font-bold">{Number(data?.total ?? 0).toFixed(2)} €</p>
              <p className="text-[12px] opacity-80">
                {data?.days_worked ?? 0} {L('jours travaillés', 'gewerkte dagen', 'days worked')} —{' '}
                {L('reste à payer', 'nog te betalen', 'unpaid')} : {Number(data?.unpaid ?? 0).toFixed(2)} €
              </p>
              {isAdmin && (data?.unpaid ?? 0) > 0 && (
                <button
                  onClick={() => payMonth.mutate()}
                  disabled={payMonth.isPending}
                  className="mt-1 px-3 py-2 rounded-lg text-[12px] font-bold bg-[#a3e635] text-[#064e3b]"
                >
                  {L('Marquer le mois payé', 'Maand betaald', 'Mark month paid')}
                </button>
              )}
            </>
          ) : (
            <p className="text-[13px] opacity-80">
              {L('Choisis un ouvrier ci-dessus.', 'Kies hierboven een arbeider.', 'Pick a worker above.')}
            </p>
          )}
        </div>

        {/* Saisie d'une journée (admin) */}
        {isAdmin && effectiveWorkerId && (
          <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
                + {L('Saisir une journée', 'Dag toevoegen', 'Add a day')}
              </div>
              <button
                onClick={() => {
                  setMonth(todayIso.slice(0, 7));
                  setNewDate(todayIso);
                }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border-2 transition-all ${
                  newDate === todayIso
                    ? 'bg-[#064e3b] text-white border-[#064e3b]'
                    : 'bg-white text-[#064e3b] border-[#a3e635]'
                }`}
              >
                {L("Aujourd'hui", 'Vandaag', 'Today')}
              </button>
            </div>
            {/* Sélecteur de jour mobile-first : bande des jours du mois affiché */}
            <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {Array.from({ length: daysInMonth(month) }, (_, i) => {
                const day = i + 1;
                const iso = `${month}-${String(day).padStart(2, '0')}`;
                const taken = existingDates.has(iso);
                const isToday = iso === todayIso;
                const sel = newDate === iso;
                return (
                  <button
                    key={iso}
                    data-selected={sel}
                    data-today={isToday}
                    disabled={taken}
                    onClick={() => setNewDate(sel ? '' : iso)}
                    className={`shrink-0 w-12 py-2 rounded-xl border-2 flex flex-col items-center transition-all ${
                      sel
                        ? 'bg-[#064e3b] text-white border-[#064e3b]'
                        : taken
                          ? 'bg-gray-50 text-gray-300 border-gray-100'
                          : isToday
                            ? 'bg-white text-[#064e3b] border-[#a3e635]'
                            : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    <span className={`text-[10px] font-medium ${sel ? 'text-white/70' : 'text-gray-400'}`}>
                      {weekdayShort(iso)}
                    </span>
                    <span className="text-[15px] font-bold leading-tight">{day}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setNewAmount(a)}
                  className={`px-3 py-2 rounded-lg text-[13px] font-bold border-2 transition-all ${
                    newAmount === a
                      ? 'bg-[#064e3b] text-white border-[#064e3b]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {a} €
                </button>
              ))}
              <input
                type="number"
                min="0"
                placeholder={L('autre', 'ander', 'other')}
                value={newAmount !== null && !AMOUNTS.includes(newAmount) ? newAmount : ''}
                onChange={(e) => setNewAmount(parseFloat(e.target.value) || null)}
                className="w-24 p-2 rounded-lg border-2 border-gray-200 text-[13px] text-right bg-white text-gray-900 placeholder:text-gray-400"
              />
            </div>
            {selectedDayLabel && (
              <p className="text-[13px] font-bold text-[#064e3b] bg-[#a3e635]/15 rounded-xl px-3 py-2">
                {selectedDayLabel}
                {newAmount !== null ? ` — ${newAmount} €` : ''}
              </p>
            )}
            <Button
              onClick={() => addDay.mutate()}
              disabled={!newDate || newAmount === null || addDay.isPending}
              className="w-full"
            >
              {addDay.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span className="text-[13px] font-bold uppercase">{L('Enregistrer', 'Opslaan', 'Save')}</span>
            </Button>
          </div>
        )}

        {/* Journées du mois */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
            {L('Journées du mois', 'Dagen van de maand', 'Days of the month')}
          </div>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-[#064e3b]" />}
          {(data?.days ?? []).map((d) => (
            <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#f8fafc]">
              <div>
                <p className="text-[14px] font-bold text-gray-900">{fmtDay(d.work_date)}</p>
                {d.note && <p className="text-[12px] text-gray-500">{d.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-bold text-gray-900">{Number(d.amount).toFixed(2)} €</span>
                {isAdmin ? (
                  <button
                    onClick={() => togglePaid.mutate({ id: d.id, paid: !d.paid })}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                      d.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {d.paid ? L('Payé', 'Betaald', 'Paid') : L('À payer', 'Te betalen', 'Unpaid')}
                  </button>
                ) : (
                  <span
                    className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                      d.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {d.paid ? L('Payé', 'Betaald', 'Paid') : L('À payer', 'Te betalen', 'Unpaid')}
                  </span>
                )}
              </div>
            </div>
          ))}
          {!isLoading && effectiveWorkerId && (data?.days ?? []).length === 0 && (
            <p className="text-[13px] text-gray-500">
              {L('Aucune journée ce mois-ci.', 'Geen dagen deze maand.', 'No days this month.')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
