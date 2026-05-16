import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// 配置中文字体
const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

// 根布局组件 - 仅包含基础html/body结构
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
          {/* 主内容区 - 子路由页面会在这里渲染 */}
          <main className="flex-1">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
