export type ThemePresetId =
  | 'classic-indigo'
  | 'editorial-teal'
  | 'dhaka-cobalt'
  | 'bengal-emerald'
  | 'obsidian-sky';

export type ThemeMode = 'light' | 'dark';

export interface ThemePresetMeta {
  id: ThemePresetId;
  name: string;
  description: string;
  swatchPrimary: string;
  swatchSecondary: string;
  prefersDarkByDefault?: boolean;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export const THEME_MODE_STORAGE_KEY = 'skillshare_theme';
export const BRAND_THEME_STORAGE_KEY = 'skillshare_brand_theme';
export const BRAND_THEME_VERSION_KEY = 'skillshare_brand_theme_version';
export const BRAND_THEME_VERSION = '2';

export const DEFAULT_THEME_PRESET: ThemePresetId = 'classic-indigo';

export const THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: 'classic-indigo',
    name: 'Classic Indigo',
    description: 'Original SkillShare indigo & emerald',
    swatchPrimary: '#4f46e5',
    swatchSecondary: '#10b981',
  },
  {
    id: 'editorial-teal',
    name: 'Editorial Teal',
    description: 'Deep teal & neutral stone canvas',
    swatchPrimary: '#0f766e',
    swatchSecondary: '#10b981',
  },
  {
    id: 'dhaka-cobalt',
    name: 'Dhaka Cobalt',
    description: 'Royal fintech blue & escrow emerald',
    swatchPrimary: '#1d4ed8',
    swatchSecondary: '#059669',
  },
  {
    id: 'bengal-emerald',
    name: 'Bengal Forest',
    description: 'Deep emerald & warm amber craft',
    swatchPrimary: '#047857',
    swatchSecondary: '#d97706',
  },
  {
    id: 'obsidian-sky',
    name: 'Tech Sky',
    description: 'Crisp ocean sky & high-contrast slate',
    swatchPrimary: '#0369a1',
    swatchSecondary: '#10b981',
  },
];

export function resolveThemePreset(value: string | null | undefined): ThemePresetId {
  if (THEME_PRESETS.some((p) => p.id === value)) {
    return value as ThemePresetId;
  }
  return DEFAULT_THEME_PRESET;
}

export function getThemePresetMeta(id: ThemePresetId): ThemePresetMeta {
  return THEME_PRESETS.find((p) => p.id === id) ?? THEME_PRESETS[0];
}

export function readPersistedThemeMode(storage?: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(THEME_MODE_STORAGE_KEY) === 'dark';
  } catch {
    return false;
  }
}

export function writePersistedThemeMode(isDark: boolean, storage?: StorageLike | null): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_MODE_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function readPersistedBrandTheme(storage?: StorageLike | null): ThemePresetId {
  if (!storage) return DEFAULT_THEME_PRESET;
  try {
    const version = storage.getItem(BRAND_THEME_VERSION_KEY);
    if (version !== BRAND_THEME_VERSION) {
      storage.setItem(BRAND_THEME_VERSION_KEY, BRAND_THEME_VERSION);
      storage.setItem(BRAND_THEME_STORAGE_KEY, DEFAULT_THEME_PRESET);
      return DEFAULT_THEME_PRESET;
    }
    return resolveThemePreset(storage.getItem(BRAND_THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_PRESET;
  }
}

export function writePersistedBrandTheme(preset: ThemePresetId, storage?: StorageLike | null): ThemePresetId {
  const resolved = resolveThemePreset(preset);
  if (!storage) return resolved;
  try {
    storage.setItem(BRAND_THEME_VERSION_KEY, BRAND_THEME_VERSION);
    storage.setItem(BRAND_THEME_STORAGE_KEY, resolved);
  } catch {
    // Ignore storage quota or private browsing errors
  }
  return resolved;
}
