"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import HeroSection from "@/components/HeroSection";
import StyleShowcase from "@/components/StyleShowcase";
import ProcessSteps from "@/components/ProcessSteps";
import ChildConsentModal from "@/components/ChildConsentModal";

interface SampleBook {
  id: string;
  title: string;
  style: string;
  coverImage: string;
  author: string;
}

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(false);
  const [sampleBooks, setSampleBooks] = useState<SampleBook[]>([]);

  // 加载示例绘本数据
  useEffect(() => {
    fetch("/sample-books.json")
      .then((res) => res.json())
      .then((data) => {
        setSampleBooks(
          data.map((book: any) => ({
            id: book.id,
            title: book.title,
            style: book.style,
            coverImage: book.coverImage,
            author: book.author,
          }))
        );
      })
      .catch((err) => console.error("Failed to load sample books:", err));
  }, []);

  // Plan B: 所有用户都可以直接进入创建流程
  const handleStartCreating = () => {
    setShowConsent(true);
  };

  const handleConsentConfirm = () => {
    setShowConsent(false);
    router.push(`/${lang}/create`);
  };

  const handleViewBook = (bookId: string) => {
    router.push(`/${lang}/book/${bookId}`);
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection lang={lang} />

      {/* Features / Process */}
      <ProcessSteps lang={lang} />

      {/* Style Showcase */}
      <StyleShowcase lang={lang} />

      {/* Sample Books Section */}
      <section id="start-creating" className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-primary-orange font-medium mb-4 block">
              {t('samples.sectionTag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {t('samples.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('samples.sectionDesc1')}
              <br />
              {t('samples.sectionDesc2')}
            </p>
          </div>

          {/* Sample Book Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleBooks.length > 0 ? (
              sampleBooks.map((book) => (
                <div
                  key={book.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewBook(book.id)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={book.coverImage || "/placeholder-book.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-600 mb-2">
                        {t(`styles.${book.style}`) || book.style}
                      </span>
                      <h3 className="text-white font-bold text-lg">
                        {book.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {t('book.by')} {book.author}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback while loading
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-2xl animate-pulse aspect-[4/5]"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-orange to-secondary-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            {t('cta.desc1')}
            <br />
            {t('cta.desc2')}
          </p>
          <button
            onClick={handleStartCreating}
            className="bg-white text-primary-orange font-bold text-lg px-12 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            {t('cta.button')}
          </button>
          <p className="text-white/70 text-sm mt-6">
            {t('cta.hint')}
          </p>
        </div>
      </section>

      {/* 儿童信息保护弹窗 */}
      <ChildConsentModal
        isOpen={showConsent}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsent(false)}
        lang={lang}
      />
    </>
  );
}
