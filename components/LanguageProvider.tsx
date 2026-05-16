"use client";

import { createContext, useContext } from 'react';
import { createTranslator } from '@/lib/i18n';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

interface LanguageContextType {
  lang: string;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh',
  t: (key) => key,
});

export function LanguageProvider({ 
  lang, 
  dict, 
  children 
}: { 
  lang: string; 
  dict: Record<string, any>; 
  children: React.ReactNode 
}) {
  const t = createTranslator(dict);
  return (
    <LanguageContext.Provider value={{ lang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
