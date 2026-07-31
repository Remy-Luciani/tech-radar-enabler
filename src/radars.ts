import { type TechItem, type QuadrantCode, type Zone, DEFAULT_ITEMS } from './data';

export interface Radar {
  id: string;
  name: string;
  quadrantNames: Record<QuadrantCode, string>;
  items: TechItem[];
  isExample: boolean;
  createdAt: number;
}

export const EXAMPLE_RADAR_ID = 'example';
const RADARS_STORAGE_KEY = 'tech-radars-v1';

export const DEFAULT_QUADRANT_NAMES: Record<QuadrantCode, string> = {
  Q1: 'Technologies',
  Q2: 'Platforms',
  Q3: 'Infrastructure',
  Q4: 'Tools & libs',
};

const VALID_QUADRANTS: QuadrantCode[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const VALID_ZONES: Zone[] = ['adopt', 'trial', 'assess', 'hold'];

function buildExampleRadar(): Radar {
  return {
    id: EXAMPLE_RADAR_ID,
    name: 'Example Radar',
    quadrantNames: { ...DEFAULT_QUADRANT_NAMES },
    items: DEFAULT_ITEMS,
    isExample: true,
    createdAt: 0,
  };
}

function isValidTechItemShape(item: unknown): item is TechItem {
  if (typeof item !== 'object' || item === null) return false;
  const i = item as Record<string, unknown>;
  if (typeof i.id !== 'string' || !/^\d+$/.test(i.id)) return false;
  if (typeof i.name !== 'string' || i.name.trim().length === 0) return false;
  if (typeof i.language !== 'string') return false;
  if (!VALID_QUADRANTS.includes(i.quadrant as QuadrantCode)) return false;
  if (!VALID_ZONES.includes(i.zone as Zone)) return false;
  return true;
}

function isValidQuadrantNames(value: unknown): value is Record<QuadrantCode, string> {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  for (const code of VALID_QUADRANTS) {
    const name = v[code];
    if (typeof name !== 'string') return false;
    if (name.trim().length === 0) return false;
  }
  return true;
}

function isValidRadar(raw: unknown): raw is Radar {
  if (typeof raw !== 'object' || raw === null) return false;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || r.id.trim().length === 0) return false;
  if (typeof r.name !== 'string' || r.name.trim().length === 0) return false;
  if (!Array.isArray(r.items)) return false;
  for (const item of r.items) {
    if (!isValidTechItemShape(item)) return false;
  }
  if (r.quadrantNames !== undefined && r.quadrantNames !== null && !isValidQuadrantNames(r.quadrantNames)) {
    return false;
  }
  if (typeof r.createdAt !== 'number') return false;
  return true;
}

function normalizeRadar(raw: Radar): Radar {
  if (raw.id === EXAMPLE_RADAR_ID) {
    return {
      ...raw,
      isExample: true,
      quadrantNames: raw.quadrantNames ?? { ...DEFAULT_QUADRANT_NAMES },
    };
  }
  return {
    ...raw,
    isExample: false,
    quadrantNames: raw.quadrantNames ?? { ...DEFAULT_QUADRANT_NAMES },
  };
}

export function loadRadars(): Radar[] {
  const example = buildExampleRadar();

  if (typeof localStorage === 'undefined') return [example];

  try {
    const raw = localStorage.getItem(RADARS_STORAGE_KEY);
    if (raw === null) return [example];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [example];

    const valid: Radar[] = [];
    for (const entry of parsed) {
      if (isValidRadar(entry)) valid.push(normalizeRadar(entry));
    }

    const storedExample = valid.find(r => r.id === EXAMPLE_RADAR_ID);
    const others = valid.filter(r => r.id !== EXAMPLE_RADAR_ID);

    if (storedExample) {
      return [{ ...storedExample, isExample: true }, ...others];
    }
    return [example, ...others];
  } catch {
    return [example];
  }
}

export function saveRadars(radars: Radar[]): void {
  try {
    localStorage.setItem(RADARS_STORAGE_KEY, JSON.stringify(radars));
  } catch {}
}

export function canDeleteRadar(radar: Radar): boolean {
  if (radar.isExample) return false;
  if (radar.id === EXAMPLE_RADAR_ID) return false;
  return true;
}

export function nextRadarName(existing: Radar[], base: string): string {
  const trimmed = base.trim();
  const candidate = trimmed.length > 0 ? trimmed : 'Untitled Radar';
  const takenNames = new Set(existing.map(r => r.name.toLowerCase()));

  if (!takenNames.has(candidate.toLowerCase())) return candidate;

  let suffix = 2;
  while (takenNames.has(`${candidate} (${suffix})`.toLowerCase())) {
    suffix += 1;
  }
  return `${candidate} (${suffix})`;
}

export function createRadar(existing: Radar[], name: string): Radar {
  return {
    id: `radar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: nextRadarName(existing, name),
    quadrantNames: { ...DEFAULT_QUADRANT_NAMES },
    items: [],
    isExample: false,
    createdAt: Date.now(),
  };
}
