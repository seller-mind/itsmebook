"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 从路径中提取当前语言
  const currentLang = pathname?.split('/')[1] || 'zh';
  const isZh = currentLang === 'zh';

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 切换语言
  const switchLanguage = (newLang: string) => {
    // 从当前路径中移除旧的语言前缀，添加新的
    const pathParts = pathname?.split('/') || [];
    if (locales.includes(pathParts[1] as any)) {
      pathParts[1] = newLang;
    } else {
      pathParts.splice(1, 0, newLang);
    }
    const newPath = pathParts.join('/') || `/${newLang}`;

    // 写入 cookie 保存语言偏好
    document.cookie = `itsmebook_lang=${newLang}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;

    setIsOpen(false);
    router.push(newPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
        aria-label="Switch language"
      >
        <span>🌐</span>
        <span>{isZh ? '中文' : 'EN'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                currentLang === lang
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{lang === 'zh' ? '🇨🇳' : '🇺🇸'}</span>
              {localeNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
