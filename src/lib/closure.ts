// Closure rules (lot 2 — Ali): mission completion is BLOCKED until the
// checklist is fully checked, at least one photo of the cleaned material is
// taken, and the fuel state (+ mileage + photo) is filled in.
// Mirrors the backend catalog (closure.catalog.ts).

export interface ChecklistItem {
  id: string;
  labels: { nl: string; fr: string; en: string };
}

export const CLOSURE_CHECKLIST: ChecklistItem[] = [
  {
    id: 'nettoyage_client',
    labels: { nl: 'Opruimen bij de klant', fr: 'Nettoyage après le client', en: 'Clean-up at the client' },
  },
  { id: 'toit_rince', labels: { nl: 'Dak afgespoeld', fr: 'Toit rincé', en: 'Roof rinsed' } },
  {
    id: 'panneaux_nettoyes',
    labels: { nl: 'Zonnepanelen gereinigd', fr: 'Panneaux solaires nettoyés', en: 'Solar panels cleaned' },
  },
  {
    id: 'hydrofuge_applique',
    labels: { nl: 'Hydrofuge aangebracht', fr: 'Hydrofuge appliqué', en: 'Hydrophobic coating applied' },
  },
  { id: 'dibo_rince', labels: { nl: 'Dibo gespoeld', fr: 'Dibo rincé', en: 'Dibo rinsed' } },
  {
    id: 'camionnette_nettoyee',
    labels: { nl: 'Bestelwagen gereinigd', fr: 'Camionnette nettoyée', en: 'Van cleaned' },
  },
];

export const FUEL_LEVELS = [
  { id: 'plein', labels: { nl: 'Vol', fr: 'Plein', en: 'Full' } },
  { id: 'moitie', labels: { nl: 'Half', fr: 'Moitié', en: 'Half' } },
  { id: 'vide', labels: { nl: 'Leeg', fr: 'Vide', en: 'Empty' } },
];

/** Equipment with a fuel tank to report on (paint machine excluded). */
export const FUEL_EQUIPMENT = ['gros_dibo', 'petit_dibo', 'camionnette', 'hilux'];

export function closureLabel(labels: { nl: string; fr: string; en: string }, locale: string): string {
  const lang = (['nl', 'fr', 'en'].includes(locale) ? locale : 'en') as 'nl' | 'fr' | 'en';
  return labels[lang];
}
