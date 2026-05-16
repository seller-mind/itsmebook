"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import BookViewer from "@/components/BookViewer";
import { useLanguage } from "@/components/LanguageProvider";

// 风格名称映射
const STYLE_NAMES: Record<string, string> = {
  watercolor: "水彩风格",
  oil: "油画风格",
  anime: "日系动漫",
  chinese: "国风水墨",
  pastoral: "温暖田园",
  fantasy: "梦幻童话",
  minimalist: "简约现代",
  nordic: "北欧极简",
};

// 主题名称映射
const THEME_NAMES: Record<string, string> = {
  adventure: "冒险",
  friendship: "友谊",
  growth: "成长",
  courage: "勇气",
  imagination: "想象力",
  family: "家庭",
  holiday: "节日",
  nature: "自然",
};

// 下载提示弹窗
function DownloadPromptModal({ isOpen, onClose, isSignedIn, lang, t }: { isOpen: boolean; onClose: () => void; isSignedIn: boolean; lang: string; t: any }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center animate-fade-in">
        <span className="text-6xl mb-6 block">📥</span>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {isSignedIn ? t('book.downloadComingSoon') : t('book.loginToDownload')}
        </h3>
        <p className="text-gray-600 mb-8">
          {isSignedIn
            ? t('book.downloadComingSoonDesc')
            : t('book.createAccountToDownload')}
        </p>
        <div className="flex flex-col gap-3">
          {!isSignedIn ? (
            <>
              <SignUpButton mode="modal">
                <button className="w-full btn-primary py-3">{t('book.freeRegister')}</button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full btn-outline py-3">{t('book.hasAccount')}</button>
              </SignInButton>
            </>
          ) : (
            <button className="w-full btn-primary py-3" onClick={onClose}>
              {t('book.gotIt')}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
          >
            {t('book.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  const params = useParams();
  const { isSignedIn } = useUser();
  const { lang, t } = useLanguage();
  const [bookData, setBookData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealBook, setIsRealBook] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  useEffect(() => {
    const loadBookData = async () => {
      const langValue = (params as any).lang;
      const bookId = (params as any).id;
      
      // 先尝试从localStorage读取真实绘本
      const savedBooks = JSON.parse(localStorage.getItem('itsmebook_books') || '[]');
      const savedBook = savedBooks.find((b: any) => b.id === bookId);
      
      if (savedBook) {
        setBookData(savedBook);
        setIsRealBook(true);
        setIsLoading(false);
        return;
      }

      // 从sample-books.json读取示例绘本
      try {
        const response = await fetch('/sample-books.json');
        const samples = await response.json();
        const sample = samples.find((s: any) => s.id === bookId);
        
        if (sample) {
          setBookData({
            ...sample,
            pages: sample.pages.map((p: any, i: number) => ({
              pageNumber: i + 1,
              text: p.text,
              imageUrl: p.imageUrl,
            })),
          });
        } else {
          // 使用默认示例
          setBookData({
            id: bookId,
            title: '小明的太空探险',
            characterName: '小明',
            style: 'fantasy',
            theme: 'adventure',
            pages: [],
          });
        }
      } catch (err) {
        console.error('Failed to load book:', err);
      }
      
      setIsLoading(false);
    };

    loadBookData();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">绘本不存在</p>
          <Link href={`/${lang}`} className="btn-primary">
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/${lang}/create`}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-orange transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('book.backToCreate')}
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDownloadPrompt(true)}
              className="btn-primary"
            >
              📥 {t('book.downloadPdf')}
            </button>
          </div>
        </div>

        {/* 标题区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {bookData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{t(`styles.${bookData.style}`) || STYLE_NAMES[bookData.style]}</span>
                <span>•</span>
                <span>{t(`create.themes.${bookData.theme}`) || THEME_NAMES[bookData.theme]}</span>
                {isRealBook && (
                  <>
                    <span>•</span>
                    <span className="text-orange-500">✨ {t('book.aiGenerated')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* AI声明 */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-700">
              <strong>{t('book.aiGenerated')}:</strong> {t('book.aiDisclaimer')}
            </p>
          </div>
        </div>

        {/* 绘本内容 */}
        <BookViewer 
          pages={bookData.pages || []} 
          title={bookData.title}
          characterName={bookData.characterName}
        />
      </div>

      {/* 下载提示弹窗 */}
      <DownloadPromptModal
        isOpen={showDownloadPrompt}
        onClose={() => setShowDownloadPrompt(false)}
        isSignedIn={isSignedIn || false}
        lang={lang}
        t={t}
      />
    </div>
  );
}
