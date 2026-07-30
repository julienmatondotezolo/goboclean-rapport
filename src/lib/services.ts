// Roof Revive service catalog — generated from
// RoofRevive/Quote-Agent-Knowledge-Base/services.json (single source of truth).
// These are the checkable services on a mission (mission_subtypes).
// "cleaning" / "coating" are legacy values kept for missions created before the catalog.

export type ServiceCategory = 'core' | 'complementary' | 'misc_surfaces';

export interface Service {
  id: string;
  category: ServiceCategory;
  labels: { nl: string; fr: string; en: string };
}

export const SERVICES: Service[] = [
  {
    id: "demoussage",
    category: "core",
    labels: { nl: "Dak ontmossen + gratis inspectie en nodige herstellingen", fr: "Démoussage de toiture + inspection gratuite et réparations nécessaires", en: "Roof cleaning with steam + free inspection and necessary repairs" },
  },
  {
    id: "gouttieres",
    category: "core",
    labels: { nl: "Goten reinigen", fr: "Nettoyage des gouttières", en: "Gutter cleaning" },
  },
  {
    id: "hydrofuge_wax",
    category: "core",
    labels: { nl: "Beschermlaag Wax voor 3 jaar garantie", fr: "Traitement hydrofuge (wax) – garantie 3 ans", en: "Hydrophobic wax coating – 3-year guarantee" },
  },
  {
    id: "deplacement",
    category: "core",
    labels: { nl: "Verplaatsing en brandstof voor machine", fr: "Déplacement + carburant machine", en: "Transportation" },
  },
  {
    id: "peinture_toiture",
    category: "complementary",
    labels: { nl: "Dak verven (antraciet)", fr: "Peinture de toiture (anthracite)", en: "Roof painting (anthracite)" },
  },
  {
    id: "facade",
    category: "complementary",
    labels: { nl: "Facades reinigen", fr: "Nettoyage de façade", en: "Façade cleaning" },
  },
  {
    id: "panneaux_solaires",
    category: "complementary",
    labels: { nl: "Zonnepanelen reinigen", fr: "Nettoyage des panneaux solaires", en: "Solar panel cleaning" },
  },
  {
    id: "nacelle",
    category: "complementary",
    labels: { nl: "Hoogtewerker huren", fr: "Location nacelle élévatrice", en: "Aerial lift rental" },
  },
  {
    id: "terrasse",
    category: "misc_surfaces",
    labels: { nl: "Terrassen reinigen", fr: "Nettoyage terrasse", en: "Terrace cleaning" },
  },
  {
    id: "mur",
    category: "misc_surfaces",
    labels: { nl: "Muur reinigen", fr: "Nettoyage de mur", en: "Wall cleaning" },
  },
  {
    id: "cheminee",
    category: "misc_surfaces",
    labels: { nl: "Schouw reinigen", fr: "Nettoyage cheminée", en: "Chimney cleaning" },
  },
  {
    id: "piliers",
    category: "misc_surfaces",
    labels: { nl: "Pilaren reinigen", fr: "Nettoyage piliers", en: "Pillar cleaning" },
  },
  {
    id: "velux",
    category: "misc_surfaces",
    labels: { nl: "Velux / ramen reinigen", fr: "Nettoyage velux / vitres", en: "Skylight / window cleaning" },
  },
  {
    id: "driveway",
    category: "misc_surfaces",
    labels: { nl: "Oprit reinigen", fr: "Nettoyage allée", en: "Driveway deepclean" },
  },
  {
    id: "escalier",
    category: "misc_surfaces",
    labels: { nl: "Trap reinigen", fr: "Nettoyage escalier", en: "Stairway deepclean" },
  },
  {
    id: "evac_mousse",
    category: "misc_surfaces",
    labels: { nl: "Al het mos meenemen", fr: "Évacuation de la mousse", en: "Haul away all moss" },
  },
];

export const SERVICE_IDS = SERVICES.map((s) => s.id);

// Legacy subtypes from before the catalog — still stored on old missions.
const LEGACY_LABELS: Record<string, { nl: string; fr: string; en: string }> = {
  cleaning: { nl: 'Reiniging', fr: 'Nettoyage', en: 'Cleaning' },
  coating: { nl: 'Coating', fr: 'Revêtement', en: 'Coating' },
};

/** Human label for a mission subtype in the given locale; falls back to the raw id. */
export function subtypeLabel(id: string, locale: string): string {
  const lang = (['nl', 'fr', 'en'].includes(locale) ? locale : 'en') as 'nl' | 'fr' | 'en';
  return SERVICES.find((s) => s.id === id)?.labels[lang] ?? LEGACY_LABELS[id]?.[lang] ?? id;
}
