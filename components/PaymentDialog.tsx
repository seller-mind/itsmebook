"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PLAN_CONFIGS } from "@/lib/plan-config";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPlan?: string;
  lang: string;
}

interface PaymentResult {
  orderId: string;
  urlQrcode?: string;
  url?: string;
  payType: string;
  amount: string;
  planName: string;
}

export default function PaymentDialog({
  isOpen,
  onClose,
  onSuccess,
  initialPlan = "standard",
  lang,
}: PaymentDialogProps) {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [selectedPayType, setSelectedPayType] = useState<"wechat" | "alipay">("wechat");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [pollingTimer, setPollingTimer] = useState<NodeJS.Timeout | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
      }
    };
  }, [pollingTimer]);

  // 关闭弹窗时重置状态
  useEffect(() => {
    if (!isOpen) {
      setPaymentResult(null);
      setPaymentSuccess(false);
      setIsLoading(false);
      if (pollingTimer) {
        clearInterval(pollingTimer);
        setPollingTimer(null);
      }
    }
  }, [isOpen, pollingTimer]);

  // 轮询支付状态
  const startPolling = useCallback((orderId: string) => {
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status?orderId=${orderId}`);
        const data = await response.json();
        
        if (data.success && data.data.status === "paid") {
          clearInterval(timer);
          setPaymentSuccess(true);
          
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      } catch (error) {
        console.error("轮询支付状态失败:", error);
      }
    }, 3000);
    
    setPollingTimer(timer);
  }, [onClose, onSuccess]);

  // 创建支付
  const handleCreatePayment = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("itsmebook_token");
      if (!token) {
        alert(t('create.loginRequired') || "请先登录");
        return;
      }
      
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          payType: selectedPayType,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentResult(data.data);
        startPolling(data.data.orderId);
      } else {
        alert(data.message || "支付创建失败");
      }
    } catch (error) {
      console.error("创建支付失败:", error);
      alert("支付创建失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 跳转到支付宝
  const handleAlipayRedirect = () => {
    if (paymentResult?.url) {
      window.location.href = paymentResult.url;
      startPolling(paymentResult.orderId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {paymentSuccess ? t('payment.paySuccess') : paymentResult ? t('payment.title') : t('payment.title')}
          </h2>
          
          {/* 支付成功状态 */}
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg text-gray-600">{t('payment.refreshing')}</p>
            </div>
          ) : paymentResult ? (
            /* 支付状态 */
            <div className="space-y-6">
              {/* 订单信息 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{t('payment.planInfo')}</span>
                  <span className="font-medium">{paymentResult.planName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{t('payment.amount')}</span>
                  <span className="font-bold text-xl text-orange-500">{paymentResult.amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('payment.orderId')}</span>
                  <span className="text-sm text-gray-500 font-mono">{paymentResult.orderId}</span>
                </div>
              </div>
              
              {/* 微信支付二维码 */}
              {paymentResult.payType === "wechat" && paymentResult.urlQrcode && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">{t('payment.wechatScan')}</p>
                  <div className="inline-block p-4 bg-white border-2 border-gray-100 rounded-xl">
                    <img 
                      src={paymentResult.urlQrcode} 
                      alt="微信支付二维码" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">{t('payment.autoRefresh')}</p>
                </div>
              )}
              
              {/* 支付宝提示 */}
              {paymentResult.payType === "alipay" && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">{t('payment.alipayRedirect')}</p>
                  <button
                    onClick={handleAlipayRedirect}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                  >
                    {t('payment.openAlipay')}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">{t('payment.autoRefresh')}</p>
                </div>
              )}
              
              {/* 返回选择 */}
              <button
                onClick={() => setPaymentResult(null)}
                className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t('payment.backToSelect')}
              </button>
            </div>
          ) : (
            /* 套餐选择 */
            <div className="space-y-4">
              {/* 套餐列表 */}
              <div className="space-y-3">
                {Object.entries(PLAN_CONFIGS).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPlan === key
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === key ? "border-orange-400" : "border-gray-300"
                        }`}>
                          {selectedPlan === key && (
                            <div className="w-3 h-3 rounded-full bg-orange-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{plan.name}</span>
                            {plan.tag && (
                              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${
                                plan.tag.includes("Pro") 
                                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                  : "bg-green-500"
                              }`}>
                                {plan.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-orange-500">{plan.priceDisplay}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* 支付方式 */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-3">{t('payment.selectPayMethod')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPayType("wechat")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPayType === "wechat"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.87c-.135-.004-.272-.01-.407-.012zm-1.56 3.33c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.857 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
                      </svg>
                      <span className={`font-medium ${selectedPayType === "wechat" ? "text-green-600" : "text-gray-600"}`}>
                        {t('payment.wechatPay')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedPayType("alipay")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPayType === "alipay"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.493 6.678a4.236 4.236 0 00-3.223-1.486l-4.58 1.433a9.493 9.493 0 01-6.75 0l-4.58-1.433a4.236 4.236 0 00-3.223 1.486 4.236 4.236 0 00-.37 3.605L.768 9.79l4.58 1.433a9.492 9.492 0 016.75 0l4.58-1.433 4.01-.947a4.236 4.236 0 00.37-3.605zM12 17.9a7.4 7.4 0 110-14.8 7.4 7.4 0 010 14.8zm-4.58-6.78a9.492 9.492 0 016.75 0l4.58-1.433-2.22-.525a4.236 4.236 0 00-5.29 1.958l-3.82-9.07-4.58 1.433a9.492 9.492 0 015.29 1.958l2.22-.525-2.93-.696zm4.58-2.36a4.236 4.236 0 013.223-1.486l4.58 1.433a7.4 7.4 0 010 5.9l-4.58-1.433a4.236 4.236 0 01-3.223-1.486 4.236 4.236 0 00-.37-3.605l3.82 9.07a7.4 7.4 0 010-5.9l-3.82-9.07a4.236 4.236 0 00.37-3.605z"/>
                      </svg>
                      <span className={`font-medium ${selectedPayType === "alipay" ? "text-blue-600" : "text-gray-600"}`}>
                        {t('payment.alipay')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* 支付按钮 */}
              <button
                onClick={handleCreatePayment}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('payment.creating')}
                  </span>
                ) : (
                  `${t('payment.payButton')} ${PLAN_CONFIGS[selectedPlan as keyof typeof PLAN_CONFIGS]?.priceDisplay}`
                )}
              </button>
              
              {/* 底部提示 */}
              <p className="text-xs text-gray-400 text-center">
                {t('payment.agreeTerms')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
