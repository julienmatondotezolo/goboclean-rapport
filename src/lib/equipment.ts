// Roof Revive equipment catalog — machines/vehicles assignable to a mission.
// Mirrors the backend catalog (equipment.catalog.ts). Conflict rule (enforced
// by the backend): one machine per day, except machine_peinture (2 units);
// camionnette is not capacity-limited.

export interface Equipment {
  id: string;
  labels: { nl: string; fr: string; en: string };
}

export const EQUIPMENT: Equipment[] = [
  { id: 'gros_dibo', labels: { nl: 'Grote Dibo', fr: 'Gros Dibo', en: 'Big Dibo' } },
  { id: 'petit_dibo', labels: { nl: 'Kleine Dibo', fr: 'Petit Dibo', en: 'Small Dibo' } },
  {
    id: 'machine_peinture',
    labels: { nl: 'Verfmachine', fr: 'Machine peinture', en: 'Paint machine' },
  },
  { id: 'camionnette', labels: { nl: 'Bestelwagen', fr: 'Camionnette', en: 'Van' } },
  { id: 'hilux', labels: { nl: 'Hilux', fr: 'Hilux', en: 'Hilux' } },
];

export const EQUIPMENT_IDS = EQUIPMENT.map((e) => e.id);

/** Human label for an equipment id in the given locale; falls back to the raw id. */
export function equipmentLabel(id: string, locale: string): string {
  const lang = (['nl', 'fr', 'en'].includes(locale) ? locale : 'en') as 'nl' | 'fr' | 'en';
  return EQUIPMENT.find((e) => e.id === id)?.labels[lang] ?? id;
}
