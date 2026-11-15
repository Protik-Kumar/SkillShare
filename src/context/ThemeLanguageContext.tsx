import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '../utils/translations';
import {
  BRAND_THEME_STORAGE_KEY,
  readPersistedBrandTheme,
  readPersistedThemeMode,
  resolveThemePreset,
  THEME_MODE_STORAGE_KEY,
  ThemePresetId,
  writePersistedBrandTheme,
  writePersistedThemeMode,
} from '../utils/themePresets';

interface ThemeLanguageContextType {
  isDark: boolean;
  toggleTheme: () => void;
  themePreset: ThemePresetId;
  setThemePreset: (preset: ThemePresetId) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function applyThemeToDocument(isDark: boolean, themePreset: ThemePresetId): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.dataset.brandTheme = themePreset;
}

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const dark = readPersistedThemeMode(getBrowserStorage());
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark);
    }
    return dark;
  });

  const [themePreset, setThemePresetState] = useState<ThemePresetId>(() => {
    const preset = readPersistedBrandTheme(getBrowserStorage());
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.brandTheme = preset;
    }
    return preset;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = getBrowserStorage()?.getItem('skillshare_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    writePersistedThemeMode(isDark, getBrowserStorage());
    applyThemeToDocument(isDark, themePreset);
  }, [isDark, themePreset]);

  useEffect(() => {
    writePersistedBrandTheme(themePreset, getBrowserStorage());
    applyThemeToDocument(isDark, themePreset);
  }, [isDark, themePreset]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_MODE_STORAGE_KEY && event.newValue !== null) {
        setIsDark(event.newValue === 'dark');
      } else if (event.key === BRAND_THEME_STORAGE_KEY && event.newValue !== null) {
        setThemePresetState(resolveThemePreset(event.newValue));
      } else if (event.key === 'skillshare_lang' && event.newValue !== null) {
        setLanguageState(event.newValue as Language);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      writePersistedThemeMode(next, getBrowserStorage());
      applyThemeToDocument(next, themePreset);
      return next;
    });
  };

  const setThemePreset = (preset: ThemePresetId) => {
    const resolved = writePersistedBrandTheme(preset, getBrowserStorage());
    setThemePresetState(resolved);
    applyThemeToDocument(isDark, resolved);
  };

  const setLanguage = (lang: Language) => {
    try {
      getBrowserStorage()?.setItem('skillshare_lang', lang);
    } catch {
      // Ignore storage errors
    }
    setLanguageState(lang);
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || String(key);
  };

  return (
    <ThemeLanguageContext.Provider
      value={{ isDark, toggleTheme, themePreset, setThemePreset, language, setLanguage, t }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
