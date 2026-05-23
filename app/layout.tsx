import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BaiduAnalytics from "@/components/BaiduAnalytics";
import CookieConsent from "@/components/CookieConsent";

// 配置中文字体
const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// 网站元数据
export const metadata: Metadata = {
  title: {
    default: "是我呀 | 每个孩子都是自己故事的主角",
    template: "%s | 是我呀",
  },
  description:
    "输入孩子的名字、兴趣和特征，AI一键生成以孩子为主角的专属绘本故事，配AI朗读。60秒出绘本，零照片零声音克隆，隐私零风险。",
  keywords: [
    "AI绘本",
    "儿童绘本",
    "个性化绘本",
    "是我呀",
    "AI生成",
    "定制绘本",
    "亲子",
    "专属故事",
    "绘本生成",
    "儿童故事",
  ],
  authors: [{ name: "是我呀" }],
  creator: "是我呀",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://itsmebook.com",
    siteName: "是我呀",
    title: "是我呀 | 每个孩子都是自己故事的主角",
    description: "输入孩子名字和兴趣，AI生成专属绘本，60秒出故事",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "是我呀",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "是我呀 | 每个孩子都是自己故事的主角",
    description: "输入孩子名字和兴趣，AI生成专属绘本，60秒出故事",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

// 根布局组件
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="zh-CN" className={`${notoSans.variable} ${notoSerif.variable}`}>
        <head>
          {/* 站点图标 */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.webmanifest" />
          
          {/* PWA Meta Tags */}
          <meta name="theme-color" content="#FF8C42" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="是我呀" />
          <meta name="application-name" content="是我呀" />
          <meta name="msapplication-TileColor" content="#FF8C42" />
          <meta name="msapplication-tap-highlight" content="no" />
          
          {/* 霞鹜文楷字体 - 儿童绘本专用 */}
          <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai&display=swap" rel="stylesheet" />
          
          {/* 百度统计 */}
          <BaiduAnalytics />
        </head>
          <body className="min-h-screen flex flex-col">
            {/* 注册 Service Worker */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          console.log('SW registered:', registration.scope);
                        })
                        .catch(function(error) {
                          console.log('SW registration failed:', error);
                        });
                    });
                  }
                `,
              }}
            />
            {/* 导航栏 */}
          <Navbar />
          
          {/* 主内容区 - pt-16为fixed导航栏留出空间 */}
          <main className="flex-1 pt-16">
            {children}
          </main>
          
          {/* Cookie同意横幅 */}
          <CookieConsent />
          
          {/* 页脚 */}
          <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
                {/* 品牌信息 */}
                <div className="md:max-w-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🌙</span>
                    <span className="text-xl font-bold text-white">是我呀</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    每个孩子都是自己故事的主角。输入名字，60秒生成专属绘本。
                  </p>
                  <div className="mt-4 space-y-1.5 text-sm">
                    <a href="mailto:haimozhouqiu@outlook.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                      <span>📧</span> haimozhouqiu@outlook.com
                    </a>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>💬</span> 微信：txd027
                    </div>
                  </div>
                </div>

                {/* 链接区 */}
                <div className="flex gap-20">
                  {/* 产品 */}
                  <div>
                    <h3 className="font-semibold text-white mb-3 text-sm">产品</h3>
                    <ul className="space-y-2.5 text-sm">
                      <li>
                        <a href="/create" className="text-gray-400 hover:text-white transition-colors">
                          开始体验
                        </a>
                      </li>
                      <li>
                        <a href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                          定价方案
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* 法律 */}
                  <div>
                    <h3 className="font-semibold text-white mb-3 text-sm">法律</h3>
                    <ul className="space-y-2.5 text-sm">
                      <li>
                        <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                          隐私政策
                        </a>
                      </li>
                      <li>
                        <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                          用户协议
                        </a>
                      </li>
                      <li>
                        <a href="/refund" className="text-gray-400 hover:text-white transition-colors">
                          退款政策
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 底部声明 */}
              <div className="mt-10 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  AI生成内容仅供娱乐参考 · 数据存储于新加坡 · © 2026 是我呀
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
