import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_THEME_STORAGE_KEY,
  BRAND_THEME_VERSION,
  BRAND_THEME_VERSION_KEY,
  DEFAULT_THEME_PRESET,
  getThemePresetMeta,
  readPersistedBrandTheme,
  readPersistedThemeMode,
  resolveThemePreset,
  THEME_MODE_STORAGE_KEY,
  THEME_PRESETS,
  writePersistedBrandTheme,
  writePersistedThemeMode,
  type StorageLike,
} from './themePresets';

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

test('resolveThemePreset returns valid preset ID or falls back to classic-indigo', () => {
  assert.equal(DEFAULT_THEME_PRESET, 'classic-indigo');
  assert.equal(resolveThemePreset(null), 'classic-indigo');
  assert.equal(resolveThemePreset('invalid-preset'), 'classic-indigo');
  assert.equal(resolveThemePreset('classic-indigo'), 'classic-indigo');
  assert.equal(resolveThemePreset('editorial-teal'), 'editorial-teal');
  assert.equal(resolveThemePreset('dhaka-cobalt'), 'dhaka-cobalt');
  assert.equal(resolveThemePreset('bengal-emerald'), 'bengal-emerald');
  assert.equal(resolveThemePreset('obsidian-sky'), 'obsidian-sky');
});

test('THEME_PRESETS have unique ids and valid hex swatches', () => {
  const ids = new Set(THEME_PRESETS.map((p) => p.id));
  assert.equal(ids.size, THEME_PRESETS.length);
  assert.equal(THEME_PRESETS[0].id, 'classic-indigo');
  for (const preset of THEME_PRESETS) {
    assert.match(preset.swatchPrimary, /^#[0-9a-f]{6}$/i);
    assert.match(preset.swatchSecondary, /^#[0-9a-f]{6}$/i);
    assert.equal(getThemePresetMeta(preset.id).name, preset.name);
  }
});

test('readPersistedBrandTheme resets pre-v2 auto-saved theme back to classic-indigo and persists user selections across sessions', () => {
  const legacyStorage = createMemoryStorage({
    [BRAND_THEME_STORAGE_KEY]: 'editorial-teal',
  });
  assert.equal(readPersistedBrandTheme(legacyStorage), 'classic-indigo');
  assert.equal(legacyStorage.getItem(BRAND_THEME_VERSION_KEY), BRAND_THEME_VERSION);
  assert.equal(legacyStorage.getItem(BRAND_THEME_STORAGE_KEY), 'classic-indigo');

  writePersistedBrandTheme('dhaka-cobalt', legacyStorage);
  assert.equal(readPersistedBrandTheme(legacyStorage), 'dhaka-cobalt');
});

test('readPersistedThemeMode and writePersistedThemeMode persist light/dark preference', () => {
  const storage = createMemoryStorage();
  assert.equal(readPersistedThemeMode(storage), false);

  writePersistedThemeMode(true, storage);
  assert.equal(storage.getItem(THEME_MODE_STORAGE_KEY), 'dark');
  assert.equal(readPersistedThemeMode(storage), true);

  writePersistedThemeMode(false, storage);
  assert.equal(storage.getItem(THEME_MODE_STORAGE_KEY), 'light');
  assert.equal(readPersistedThemeMode(storage), false);
});
