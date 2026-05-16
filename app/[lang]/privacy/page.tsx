import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return {
    title: dict.seo?.privacyTitle || "Privacy Policy",
    description: lang === 'zh' 
      ? "是我呀隐私政策，了解我们如何保护您的个人信息" 
      : "Privacy Policy for It's Me! - Learn how we protect your personal information",
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isZh = lang === 'zh';

  if (isZh) {
    return <ChinesePrivacyPage />;
  } else {
    return <EnglishPrivacyPage dict={dict} />;
  }
}

function ChinesePrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">隐私政策</h1>
          <p className="text-gray-500">最后更新日期：2026年5月14日</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 概述
            </h2>
            <p className="text-gray-600 leading-relaxed">
              "是我呀"（以下简称"我们"）非常重视用户的隐私和个人信息保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息，以及您享有的相关权利。请您在使用我们的服务前，仔细阅读并了解本隐私政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> 信息收集
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 您主动提供的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>账户信息：注册时提供的邮箱、昵称等</li>
                <li>照片：您上传的用于生成绘本的孩子照片</li>
                <li>创作偏好：选择的绘本风格、主题等信息</li>
                <li>反馈信息：您向我们提供的建议或反馈</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 自动收集的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>设备信息：设备类型、操作系统等</li>
                <li>使用数据：功能使用情况、生成记录等</li>
                <li>日志信息：访问时间、浏览记录等</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔐</span> 信息使用
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              我们收集的信息将用于以下目的：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>提供、维护和改进我们的服务</li>
              <li>生成您定制的绘本内容</li>
              <li>处理您的支付和订阅</li>
              <li>向您发送服务相关的通知</li>
              <li>回应您的咨询和反馈</li>
              <li>分析服务使用情况，优化用户体验</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛡️</span> 信息保护
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们采取多种安全措施保护您的信息安全：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>传输加密：使用HTTPS加密传输所有数据</li>
                <li>存储加密：敏感信息采用加密存储</li>
                <li>访问控制：严格限制员工访问权限</li>
                <li>定期审计：定期进行安全审查</li>
                <li>数据备份：定期备份防止数据丢失</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🍪</span> Cookie使用
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们使用Cookie和类似技术来改善用户体验，包括记住您的偏好设置、分析网站流量等。您可以通过浏览器设置禁用Cookie，但这可能影响部分服务功能。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👶</span> 儿童隐私
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们特别重视儿童的隐私保护。作为家长或监护人：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>您需确认同意后，孩子才能使用我们的服务</li>
                <li>我们不会故意收集13岁以下儿童的个人信息</li>
                <li>您上传的照片仅用于生成您的个人绘本</li>
                <li>您可以随时删除孩子的照片和相关内容</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span> 您的权利
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              根据适用法律，您享有以下权利：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>访问您的个人信息</li>
              <li>更正不准确的信息</li>
              <li>删除您的个人信息</li>
              <li>撤回同意（如适用）</li>
              <li>导出您的数据</li>
              <li>投诉权</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> 第三方服务
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们的服务可能包含指向第三方网站的链接。我们不对第三方网站的隐私实践负责。建议您查看这些第三方的隐私政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed">
              如您对本隐私政策有任何疑问，请通过以下方式联系我们：
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>邮箱：</strong> haimozhouqiu@outlook.com
              </p>
              <p className="text-gray-600">
                <strong>微信号：</strong> txd027
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔄</span> 政策更新
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能会不时更新本隐私政策。重大变更将在网站上公布并更新"最后更新日期"。建议您定期查阅本政策。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function EnglishPrivacyPage({ dict }: { dict: Record<string, any> }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last Updated: May 14, 2026</p>
        </div>

        {/* AI Content Disclaimer Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ AI-Generated Content Disclaimer:</strong> All stories and illustrations on this platform are generated by artificial intelligence and are intended for entertainment purposes only. They do not represent real events, people, or opinions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              It's Me! ("we," "us," or "our") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your personal data, and what rights you have regarding your information. Please read this policy carefully before using our services.
            </p>
          </section>

          <section id="information-we-collect">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Information We Collect
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Phone number used for registration and login</li>
                <li><strong>Photographs:</strong> Photos you upload of your child for generating picture book illustrations</li>
                <li><strong>Character Information:</strong> Child's name, age, gender, and appearance description</li>
                <li><strong>Creative Preferences:</strong> Selected art styles and story themes</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                <li><strong>Usage Data:</strong> Features used, generation history, session duration</li>
                <li><strong>Log Information:</strong> Access times, pages visited, referring URLs</li>
              </ul>
            </div>
          </section>

          <section id="how-we-use">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔐</span> How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Providing, maintaining, and improving our services</li>
              <li>Generating your personalized picture book content</li>
              <li>Processing payments and subscriptions</li>
              <li>Sending service-related notifications</li>
              <li>Ensuring security and preventing fraud</li>
            </ul>
          </section>

          <section id="coppa">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👶</span> Children's Privacy (COPPA Compliance)
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>🛡️ COPPA Compliant:</strong> Our service is designed for use by children ages 3-12 with parental consent. We comply with the U.S. Children's Online Privacy Protection Act.
              </p>
            </div>
            
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>As a parent or legal guardian:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Verifiable Parental Consent:</strong> You must provide verifiable parental consent before your child uses our service</li>
                <li><strong>Photos:</strong> Uploaded photos are used ONLY to generate personal picture book illustrations</li>
                <li><strong>No Third-Party Advertising:</strong> We do not use children's information for advertising</li>
                <li><strong>Your Rights:</strong> Review, delete, or refuse further collection at any time</li>
                <li><strong>AI Data Processing:</strong> Data is NOT used to train AI models</li>
              </ul>
            </div>
          </section>

          <section id="gdpr">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🇪🇺</span> Your Rights Under GDPR (European Users)
            </h2>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
              <p className="text-purple-800 text-sm">
                <strong>🛡️ GDPR Compliant:</strong> For users in the European Economic Area, we comply with the General Data Protection Regulation.
              </p>
            </div>
            
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
            </ul>
          </section>

          <section id="privacy-rights">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔒</span> California Privacy Rights (CCPA)
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Right to Know:</strong> Request disclosure of personal information collected</li>
              <li><strong>Right to Delete:</strong> Request deletion of personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information</li>
            </ul>
            <p className="mt-4 text-gray-600">
              <strong>Do Not Sell My Personal Information:</strong> We do not sell personal information.
            </p>
          </section>

          <section id="data-security">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛡️</span> Data Security
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Encryption in Transit:</strong> HTTPS/TLS encryption for all data</li>
              <li><strong>Encryption at Rest:</strong> Sensitive information encrypted during storage</li>
              <li><strong>Access Controls:</strong> Strict employee access controls</li>
              <li><strong>Secure AI Processing:</strong> Third-party AI providers under strict DPAs</li>
            </ul>
          </section>

          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> Contact Us / Data Protection Officer
            </h2>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>Email:</strong> haimozhouqiu@outlook.com
              </p>
              <p className="text-gray-600 mt-2">
                <strong>WeChat:</strong> txd027
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              We will respond to your request within 30 days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
