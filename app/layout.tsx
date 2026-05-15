import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
    default: "是我呀 - AI儿童绘本 | 你的孩子就是绘本的主角",
    template: "%s | 是我呀",
  },
  description:
    "使用AI技术，为您的孩子创作独一无二的专属绘本。上传照片，选择风格，AI自动生成20页精美绘本故事。",
  keywords: [
    "AI绘本",
    "儿童绘本",
    "AI生成",
    "定制绘本",
    "亲子",
    "儿童故事",
    "绘本创作",
  ],
  authors: [{ name: "是我呀" }],
  creator: "是我呀",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://itsmebook.com",
    siteName: "是我呀",
    title: "是我呀 - AI儿童绘本 | 你的孩子就是绘本的主角",
    description: "使用AI技术，为您的孩子创作独一无二的专属绘本",
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
    title: "是我呀 - AI儿童绘本",
    description: "你的孩子就是绘本的主角",
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
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body className="min-h-screen flex flex-col">
          {/* 导航栏 */}
          <Navbar />
          
          {/* 主内容区 */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* 页脚 */}
          <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* 品牌信息 */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📚</span>
                    <span className="text-xl font-bold text-gray-900">是我呀</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    你的孩子就是绘本的主角。<br />
                    用AI为孩子创作独一无二的专属故事。
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
                        开始制作
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
                
                {/* 联系方式 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">联系我们</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span>📧</span>
                      <span>contact@itsmebook.com</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>💬</span>
                      <span>微信公众号：itsmebook</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* 底部声明 */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  本网站所有AI生成内容仅供娱乐参考，不代表任何真实事件或观点。
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
