"use client";

import { useEffect } from "react";

const COOKIE_CONSENT_KEY = "itsmebook_cookie_consent";

/**
 * 百度统计组件
 * 通过环境变量 NEXT_PUBLIC_BAIDU_ANALYTICS_ID 配置统计ID
 * 如果没有配置则不渲染任何内容
 * 只有用户同意Cookie政策后才加载
 */
export default function BaiduAnalytics() {
  useEffect(() => {
    // 检查Cookie同意状态
    const consentStr = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consentStr) {
      try {
        const consent = JSON.parse(consentStr);
        if (!consent.accepted) {
          // 用户拒绝Cookie，不加载统计
          return;
        }
      } catch {
        // 解析失败，不加载统计
        return;
      }
    } else {
      // 用户尚未做出选择，不加载统计
      return;
    }

    // 从环境变量获取百度统计ID
    const baiduAnalyticsId = process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID;
    
    // 如果没有配置ID，不进行任何操作
    if (!baiduAnalyticsId) {
      console.log("百度统计未配置（NEXT_PUBLIC_BAIDU_ANALYTICS_ID）");
      return;
    }

    // 初始化百度统计
    const _hmt = (window as any)._hmt || [];
    
    // 添加百度统计脚本
    const hm = document.createElement("script");
    hm.src = `https://hm.baidu.com/hm.js?${baiduAnalyticsId}`;
    hm.async = true;
    
    const s = document.getElementsByTagName("script")[0];
    s.parentNode?.insertBefore(hm, s);

    // 保存到window对象
    (window as any)._hmt = _hmt;

    // 页面浏览事件自动上报
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      // 页面切换时触发统计
      setTimeout(() => {
        if ((window as any)._hmt) {
          (window as any)._hmt.push(["_trackPageview", window.location.pathname]);
        }
      }, 100);
    };

    // 监听 popstate 事件（浏览器前进后退）
    const handlePopState = () => {
      if ((window as any)._hmt) {
        (window as any)._hmt.push(["_trackPageview", window.location.pathname]);
      }
    };
    window.addEventListener("popstate", handlePopState);

    // 监听Cookie同意事件（用户同意后立即加载）
    const handleConsentAccepted = () => {
      // 重新检查并加载
      const hm2 = document.createElement("script");
      hm2.src = `https://hm.baidu.com/hm.js?${baiduAnalyticsId}`;
      hm2.async = true;
      const s2 = document.getElementsByTagName("script")[0];
      s2.parentNode?.insertBefore(hm2, s2);
    };
    window.addEventListener("cookieConsentAccepted", handleConsentAccepted);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("cookieConsentAccepted", handleConsentAccepted);
    };
  }, []);

  return null;
}
