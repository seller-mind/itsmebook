// i18n 国际化工具

// 支持的语言
export const locales = ['zh', 'en'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'zh';

// 验证语言是否合法
export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}

// 获取翻译字典
export async function getDictionary(lang: string): Promise<Record<string, any>> {
  const validLang = isValidLocale(lang) ? lang : defaultLocale;
  try {
    return (await import(`@/messages/${validLang}.json`)).default;
  } catch {
    return (await import(`@/messages/${defaultLocale}.json`)).default;
  }
}

// 客户端用：从字典获取翻译函数
export function createTranslator(dict: Record<string, any>) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value !== 'string') return key;
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, String(v)),
        value
      );
    }
    return value;
  };
}

// 获取当前语言对应的 hreflang
export function getHreflangAlternates(currentLang: string, baseUrl: string = 'https://www.itsmebook.com') {
  const alternates: Record<string, string> = {
    'zh': `${baseUrl}/zh`,
    'en': `${baseUrl}/en`,
    'x-default': `${baseUrl}/zh`,
  };
  return alternates;
}

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  'zh': '中文',
  'en': 'EN',
};

// 语言旗帜emoji
export const localeFlags: Record<Locale, string> = {
  'zh': '🇨🇳',
  'en': '🇺🇸',
};
