'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Locale, TranslationDictionary } from '../locales/translations';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationDictionary>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'masar_locale';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('ar');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === 'ar' || saved === 'en') {
      setLocaleState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    } else {
      // Default to Arabic
      setLocaleState('ar');
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLocale;
    }
  }, []);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale] || translations.ar;
      const keys = path.split('.');

      let value: any = dict;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English if key missing in current locale
          let fallbackVal: any = translations.en;
          for (const fbKey of keys) {
            if (fallbackVal && typeof fallbackVal === 'object' && fbKey in fallbackVal) {
              fallbackVal = fallbackVal[fbKey];
            } else {
              fallbackVal = undefined;
              break;
            }
          }
          value = fallbackVal || path;
          break;
        }
      }

      if (typeof value !== 'string') {
        return path;
      }

      if (params) {
        return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
          return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
        }, value);
      }

      return value;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dir, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
