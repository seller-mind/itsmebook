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
          <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* 品牌信息 */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🌙</span>
                    <span className="text-xl font-bold text-gray-900">是我呀</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    每个孩子都是自己故事的主角。<br />
                    输入名字，60秒生成专属绘本。
                  </p>
                  <p className="text-sm text-gray-400">
                    © 2026 是我呀 All Rights Reserved.
                  </p>
                </div>
                
                {/* 快速链接 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">快速链接</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      <a href="/create" className="hover:text-primary-orange transition-colors">
                        开始录制
                      </a>
                    </li>
                    <li>
                      <a href="/pricing" className="hover:text-primary-orange transition-colors">
                        定价方案
                      </a>
                    </li>
                    <li>
                      <a href="/privacy" className="hover:text-primary-orange transition-colors">
                        隐私政策
                      </a>
                    </li>
                    <li>
                      <a href="/terms" className="hover:text-primary-orange transition-colors">
                        用户协议
                      </a>
                    </li>
                  </ul>
                </div>
                
                {/* 法律声明 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">法律声明</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      <a href="/refund" className="hover:text-primary-orange transition-colors">
                        退款政策
                      </a>
                    </li>
                    <li>
                      <a href="/cookie" className="hover:text-primary-orange transition-colors">
                        Cookie政策
                      </a>
                    </li>
                  </ul>
                </div>
                
                {/* 联系方式 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">联系我们</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span>📧</span>
                      <a href="mailto:haimozhouqiu@outlook.com" className="hover:text-primary-orange transition-colors">haimozhouqiu@outlook.com</a>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>💬</span>
                      <span>微信号：txd027</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 底部声明 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    本网站所有AI生成内容仅供娱乐参考，不代表任何真实事件或观点。用户须确保上传的录音内容拥有合法使用权，因上传内容导致的侵权由用户自行承担。
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    本服务使用的AI模型由火山引擎提供 | AI生成内容可能存在不准确性，请理性看待
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    📍 本网站数据存储于海外云服务平台（新加坡）
                  </p>
                  <p className="text-sm text-gray-400 text-center">
                    {/* ICP备案号：待域名备案完成后填写，例如：京ICP备XXXXXXXX号 */}
                    {/* 公安联网备案：待公安联网备案完成后填写 */}
                    © 2026 是我呀 All Rights Reserved.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
