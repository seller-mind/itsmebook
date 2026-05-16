import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return {
    title: dict.seo?.termsTitle || "用户协议",
    description: lang === 'zh' 
      ? "是我呀用户服务协议，使用条款和条件" 
      : "Terms of Service for It's Me! - Usage terms and conditions",
  };
}

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isZh = lang === 'zh';

  if (isZh) {
    return <ChineseTermsPage />;
  } else {
    return <EnglishTermsPage />;
  }
}

function ChineseTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">用户协议</h1>
          <p className="text-gray-500">最后更新日期：2026年5月14日</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 概述
            </h2>
            <p className="text-gray-600 leading-relaxed">
              欢迎使用"是我呀"服务！本协议是您与"是我呀"之间关于使用我们服务产生的权利义务关系的法律协议。在使用我们的服务之前，请仔细阅读本协议的全部内容。如果您不同意本协议的任何内容，请不要注册或使用我们的服务。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✅</span> 服务说明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>"是我呀"提供服务包括：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI绘本生成服务</li>
                <li>照片上传和处理</li>
                <li>绘本预览和下载</li>
                <li>账户管理功能</li>
                <li>相关技术支持</li>
              </ul>
              <p>我们保留随时调整、修改或中断服务功能的权利，并会提前通知用户。</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span> 账户注册
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 账户要求</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>年满18周岁的成年人</li>
                <li>提供真实有效的注册信息</li>
                <li>妥善保管账户密码</li>
                <li>对账户下所有活动负责</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 账户安全</h3>
              <p>您应当对账户安全负责。如发现任何未经授权使用您账户的情况，应立即通知我们。</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📷</span> 照片上传
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>您上传照片即表示：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>您拥有或已获得照片中所有人的授权</li>
                <li>照片不含任何非法或有害内容</li>
                <li>同意我们使用照片生成您的个人绘本</li>
                <li>同意照片的加密存储处理</li>
              </ul>
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ 注意：</strong>您不得上传包含他人肖像的照片，除非您已获得肖像权人的明确授权。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✨</span> AI生成内容
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 内容所有权</h3>
              <p>您使用AI生成的内容版权归您个人所有，您有权自由使用、分享和打印。</p>

              <h3 className="font-semibold text-gray-800">2. 内容规范</h3>
              <p>您不得使用AI生成以下类型的内容：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>违反法律法规的内容</li>
                <li>侵犯他人权益的内容</li>
                <li>色情、暴力、恐怖内容</li>
                <li>虚假或误导性信息</li>
                <li>商业广告或推广内容</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 内容声明</h3>
              <p>AI生成的内容均标注"AI生成"标识，仅供娱乐参考，不代表任何真实事件或观点。</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> 付费服务
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 定价和支付</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>定价以购买页面显示为准</li>
                <li>支持支付宝等支付方式</li>
                <li>付费成功后即时生效</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 退款政策</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>付费会员开通7天内可申请全额退款</li>
                <li>超过7天不支持退款</li>
                <li>特殊情况可联系客服协商</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 自动续费</h3>
              <p>订阅服务到期前会自动续费，您可在账户设置中取消自动续订。</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🚫</span> 禁止行为
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">使用我们的服务时，您不得：</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>违反任何适用法律法规</li>
              <li>侵犯他人知识产权或隐私权</li>
              <li>尝试破解、入侵或破坏我们的系统</li>
              <li>使用自动化工具大规模生成内容</li>
              <li>转售、转授权我们的服务</li>
              <li>传播恶意软件或病毒</li>
              <li>冒充他人或机构</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 免责声明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们的服务按"现状"提供，不作任何明示或暗示的保证：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>不保证服务完全无错误或持续可用</li>
                <li>不保证AI生成内容完全准确或合适</li>
                <li>不对用户生成的内容承担责任</li>
                <li>不对因不可抗力导致的服务中断负责</li>
              </ul>
              <p>在法律允许的最大范围内，我们不对任何间接、附带、特殊或后果性损害承担责任。</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> 协议变更
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们保留随时修改本协议的权利。重大变更将通过网站公告或邮件通知。如您不同意修改后的协议，可停止使用服务。继续使用服务即表示接受修改后的协议。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">如您对本协议有任何疑问，请联系我们：</p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>邮箱：</strong> haimozhouqiu@outlook.com
              </p>
              <p className="text-gray-600">
                <strong>微信号：</strong> txd027
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function EnglishTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500">Last Updated: May 14, 2026</p>
        </div>

        {/* AI Content Disclaimer Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ AI-Generated Content Disclaimer:</strong> All stories and illustrations on this platform are generated by artificial intelligence and are intended for entertainment purposes only. They do not represent real events, people, or opinions. Parental review is recommended before sharing with children.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to It's Me! By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✅</span> Description of Service
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>It's Me! provides the following services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-powered picture book generation</li>
                <li>Photo upload and processing</li>
                <li>Book preview and download</li>
                <li>Account management</li>
                <li>Technical support</li>
              </ul>
              <p>We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span> Account Registration
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Account Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must be at least 18 years old</li>
                <li>Provide accurate registration information</li>
                <li>Maintain the security of your account</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Account Security</h3>
              <p>You are responsible for maintaining the security of your account. If you detect unauthorized use, notify us immediately.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📷</span> Photo Upload
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>By uploading photos, you confirm that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You own or have authorization from all individuals in the photos</li>
                <li>Photos do not contain illegal or harmful content</li>
                <li>You consent to using photos for generating your personal picture books</li>
                <li>Photos will be encrypted and securely stored</li>
              </ul>
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ Notice:</strong> You may not upload photos containing others' likenesses without explicit authorization from the rights holder.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✨</span> AI-Generated Content
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>🛡️ AI Content Ownership:</strong> You retain ownership of the AI-generated content created using your account. You may freely use, share, and print content for personal purposes.
                </p>
              </div>

              <h3 className="font-semibold text-gray-800">1. Content Ownership</h3>
              <p>You own the content generated using our service and may use it for personal, non-commercial purposes.</p>

              <h3 className="font-semibold text-gray-800">2. Content Guidelines</h3>
              <p>You shall NOT use our AI to generate:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Content that violates laws or regulations</li>
                <li>Content that infringes on others' rights</li>
                <li>Pornographic, violent, or恐怖 content</li>
                <li>False or misleading information</li>
                <li>Commercial advertising or promotional content</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. AI Content Disclaimer</h3>
              <p>All generated content is marked as "AI-Generated" and is for entertainment reference only. It does not represent real events, people, or opinions.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👶</span> Age Requirements & Children's Use
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>🛡️ COPPA Notice:</strong> This service is intended for children ages 3-12 with parental consent. Parents/guardians must review and agree to these terms on behalf of minors.
                </p>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Parents/guardians must provide verifiable consent before children use the service</li>
                <li>Parents are responsible for supervising children's use</li>
                <li>AI-generated content should be reviewed by parents before sharing with children</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> Paid Services
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Pricing & Payment</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Prices are as displayed on the purchase page</li>
                <li>We accept WeChat Pay and Alipay</li>
                <li>Services are activated immediately after payment</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Refund Policy</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Full refund within 7 days of purchase</li>
                <li>No refunds after 7 days</li>
                <li>Contact customer service for special circumstances</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. Subscription Auto-Renewal</h3>
              <p>Subscription services will auto-renew. You may cancel auto-renewal in account settings.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🚫</span> Prohibited Conduct
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">When using our service, you must NOT:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on others' intellectual property or privacy rights</li>
              <li>Attempt to hack, breach, or disrupt our systems</li>
              <li>Use automated tools to generate content at scale</li>
              <li>Resell or sublicense our service</li>
              <li>Spread malware or viruses</li>
              <li>Impersonate others or organizations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> Limitation of Liability
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Our service is provided "AS IS" without any warranties:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not guarantee the service is error-free or continuously available</li>
                <li>We do not guarantee AI-generated content is accurate or appropriate</li>
                <li>We are not responsible for user-generated content</li>
                <li>We are not liable for service interruptions due to force majeure</li>
              </ul>
              <p>To the maximum extent permitted by law, we are not liable for any indirect, incidental, special, or consequential damages.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> Modifications to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Significant changes will be posted on our website or notified by email. Continued use of the service constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">For questions about these terms:</p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>Email:</strong> haimozhouqiu@outlook.com
              </p>
              <p className="text-gray-600">
                <strong>WeChat:</strong> txd027
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏛️</span> Governing Law
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by and construed in accordance with the laws of the People's Republic of China. Any disputes shall be subject to the exclusive jurisdiction of the courts of the People's Republic of China.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
