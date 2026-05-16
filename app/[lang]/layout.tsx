import type { Metadata } from "next";
import { getDictionary, isValidLocale, defaultLocale, locales } from "@/lib/i18n";
import { LanguageProvider } from "@/components/LanguageProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  const currentLang = isValidLocale(lang) ? lang : defaultLocale;
  
  return {
    title: {
      default: dict.seo?.homeTitle || "是我呀 - AI儿童绘本",
      template: `%s | ${dict.common?.appName || '是我呀'}`,
    },
    description: dict.seo?.homeDesc || "使用AI技术，为您的孩子创作独一无二的专属绘本。",
    alternates: {
      canonical: `https://www.itsmebook.com/${currentLang}`,
      languages: {
        'zh': 'https://www.itsmebook.com/zh',
        'en': 'https://www.itsmebook.com/en',
        'x-default': 'https://www.itsmebook.com/zh',
      },
    },
    openGraph: {
      type: "website",
      locale: currentLang === 'zh' ? 'zh_CN' : 'en_US',
      url: `https://www.itsmebook.com/${currentLang}`,
      siteName: dict.common?.appName || '是我呀',
      title: dict.seo?.homeTitle || "是我呀 - AI儿童绘本",
      description: dict.seo?.homeDesc || "",
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;
  
  // 验证语言，不合法则重定向
  if (!isValidLocale(lang)) {
    return null; // middleware 会处理重定向
  }
  
  const dict = await getDictionary(lang);
  
  return (
    <LanguageProvider lang={lang} dict={dict}>
      <Navbar lang={lang} />
      {children}
      <Footer lang={lang} />
    </LanguageProvider>
  );
}
