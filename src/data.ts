export type Zone = 'adopt' | 'trial' | 'assess' | 'hold';
export type QuadrantCode = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface TechItem {
  id: string;
  name: string;
  language: string;
  quadrant: QuadrantCode;
  zone: Zone;
}

export const ZONE_CONFIG: Record<Zone, { label: string; innerR: number; outerR: number; color: string }> = {
  adopt:   { label: 'ADOPT',   innerR: 78,   outerR: 201,  color: '#22c55e' },
  trial:   { label: 'TRIAL',   innerR: 201,  outerR: 276,  color: '#facc15' },
  assess:  { label: 'ASSESS',  innerR: 276,  outerR: 349,  color: '#f97316' },
  hold:    { label: 'HOLD',    innerR: 349,  outerR: 400,  color: '#ef4444' },
};

export const QUADRANT_CONFIG = {
  Q1: { name: 'Technologies',     color: '#6366f1', angleRange: [-Math.PI / 2, 0] as [number, number] },
  Q2: { name: 'Platforms',        color: '#ec4899', angleRange: [-Math.PI, -Math.PI / 2] as [number, number] },
  Q3: { name: 'Infrastructure',   color: '#06b6d4', angleRange: [-Math.PI / 2, Math.PI] as [number, number] },
  Q4: { name: 'Tools & libs',     color: '#a78bfa', angleRange: [0, Math.PI / 2] as [number, number] },
};

export const DEFAULT_ITEMS: TechItem[] = [
  { id: '1',   name: 'React',                language: 'Framework',    quadrant: 'Q1', zone: 'adopt'    },
  { id: '2',   name: 'TypeScript',           language: 'Language',     quadrant: 'Q1', zone: 'adopt'    },
  { id: '3',   name: 'SvelteKit',            language: 'Framework',    quadrant: 'Q1', zone: 'trial'    },
  { id: '4',   name: 'Vue 3',                language: 'Framework',    quadrant: 'Q1', zone: 'adopt'    },
  { id: '5',   name: 'SolidJS',              language: 'Framework',    quadrant: 'Q1', zone: 'assess'   },
  { id: '6',   name: 'AI Pair Programming',  language: 'Practices',    quadrant: 'Q2', zone: 'adopt'    },
  { id: '7',   name: 'Clean Architecture',   language: 'Framework',    quadrant: 'Q2', zone: 'trial'    },
  { id: '8',   name: 'Feature Flags',        language: 'Practices',    quadrant: 'Q2', zone: 'adopt'    },
  { id: '9',   name: 'TDD',                  language: 'Practices',    quadrant: 'Q2', zone: 'assess'   },
  { id: '10',  name: 'Kubernetes',           language: 'Platform',     quadrant: 'Q3', zone: 'adopt'    },
  { id: '11',  name: 'Terraform',            language: 'Tool',         quadrant: 'Q3', zone: 'trial'    },
  { id: '12',  name: 'Serverless',           language: 'Architect.',   quadrant: 'Q3', zone: 'hold'     },
  { id: '13',  name: 'WebAssembly',          language: 'Platform',     quadrant: 'Q3', zone: 'assess'   },
  { id: '14',  name: 'GitHub Actions',       language: 'Tool',         quadrant: 'Q4', zone: 'adopt'    },
  { id: '15',  name: 'Cypress',              language: 'Tool',         quadrant: 'Q4', zone: 'assess'   },
  { id: '16',  name: 'Docker',               language: 'Tool',         quadrant: 'Q4', zone: 'adopt'    },
];

export const STORAGE_KEY = 'tech-radar-items';

const VALID_ZONES: Zone[] = ['adopt', 'trial', 'assess', 'hold'];
const VALID_QUADRANTS: QuadrantCode[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function isValidTechItem(item: unknown): item is TechItem {
  if (typeof item !== 'object' || item === null) return false;
  const i = item as Record<string, unknown>;
  return typeof i.id === 'string' && /^\d+$/.test(i.id) && typeof i.name === 'string' && typeof i.language === 'string'
    && VALID_QUADRANTS.includes(i.quadrant as QuadrantCode) && VALID_ZONES.includes(i.zone as Zone);
}

export function loadItems(): TechItem[] {
  if (typeof localStorage === 'undefined') return DEFAULT_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(isValidTechItem);
        if (valid.length) return valid;
      }
    }
  } catch {}
  return DEFAULT_ITEMS;
}

export function saveItems(items: TechItem[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

export const LANG_COLORS: Record<string, string> = {
  Framework:    '#60a5fa', Language:     '#f472b6', Practices:    '#34d399',
  Platform:     '#22d3ee', 'Architect.': '#c084fc', Tool:         '#fb923c',
};

export function langColor(lang: string): string { return LANG_COLORS[lang] || '#94a3b8'; }
