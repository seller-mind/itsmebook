import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "It's Me Book Privacy Policy - Learn how we protect your personal information",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last Updated: May 17, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              It's Me Book (hereinafter "we," "us," or "our") is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, store, and protect your personal information, as well as the rights you have regarding your data. Please read and understand this Privacy Policy carefully before using our services.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Important Notice:</strong> This product is designed for parental use. We only collect your voice recordings for story generation. <strong>We do not collect photos of children, personal information of children, or biometric data of children.</strong> The product does not actively interact with children; all operations are performed by parents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚖️</span> Legal Basis
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>We process your personal information based on the following legal grounds:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Consent:</strong> We process your data with your explicit consent</li>
                <li><strong>Contract Performance:</strong> When you purchase our services, we need to process your information to fulfill our contractual obligations</li>
                <li><strong>Legal Obligations:</strong> We may be required by law to retain certain data (such as transaction records)</li>
                <li><strong>Legitimate Interests:</strong> To protect our network security and prevent fraud, we may process necessary information</li>
              </ul>
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>💡 Note:</strong> We only process your personal information when we have a lawful basis and collect only the minimum information necessary to provide our services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Information Collection
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Voice Recordings:</strong> Voice samples you record on the recording page, used for AI voice synthesis and story generation. This information is only used to create personalized bedtime stories for your child and will not be used for any other purpose.</li>
                <li>Account Information: Email address and phone number provided during registration</li>
                <li>Story Preferences: Selected story themes, child&apos;s name, and other relevant information</li>
                <li>Feedback: Suggestions or feedback you provide to us</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device Information: Device type, operating system, etc.</li>
                <li>Usage Data: Feature usage patterns, generation history, etc.</li>
                <li>Log Information: Access time, browsing history, etc.</li>
                <li>Cookie Information:访问偏好、登录状态等</li>
              </ul>

              <h3 className="font-semibold text-gray-800 font-bold text-green-700">🚫 Information We Do NOT Collect</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-green-600">
                <li><strong>We do not collect user photos or photos of children</strong></li>
                <li><strong>We do not collect precise geolocation data</strong></li>
                <li><strong>We do not collect contact information from your address book</strong></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎤</span> Voice Data Special Notice
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>We take your voice data security very seriously and implement the following protective measures:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Purpose Limitation:</strong> Your voice data is used exclusively for generating your personalized bedtime stories and will not be used to train AI models</li>
                <li><strong>Encrypted Storage:</strong> Voice data is stored using AES-256 encryption</li>
                <li><strong>Deletion on Request:</strong> You may contact us at any time to delete your voice data</li>
                <li><strong>No Third-Party Sharing:</strong> Your voice data will not be sold or shared with any third parties</li>
                <li><strong>Local-First Processing:</strong> Some processing is performed locally on your device to minimize data transmission</li>
              </ul>
              <p className="bg-green-50 p-4 rounded-xl border border-green-200">
                <strong>💡 Your Rights:</strong> You have complete control over your child&apos;s personalized data and may request deletion at any time. After deletion, we will be unable to restore your voice synthesis data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔐</span> Data Protection
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>We implement multiple security measures to protect your information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Transmission Encryption: All data is transmitted using HTTPS/TLS encryption</li>
                <li>Storage Encryption: Sensitive information is stored using AES-256 encryption</li>
                <li>Access Controls: Strict limitations on employee access privileges</li>
                <li>Regular Audits: Periodic security reviews and vulnerability scans</li>
                <li>Data Backup: Regular backups to prevent data loss</li>
                <li>Data Minimization: We collect only the minimum information necessary to provide services</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> Third-Party Services
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>We use the following third-party service providers to support our services:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">Service Provider</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Purpose</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Data Collected</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Privacy Policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3 font-medium">Supabase</td>
                      <td className="border border-gray-200 p-3">Data storage, user data management</td>
                      <td className="border border-gray-200 p-3">User account data, voice data (encrypted), generated content</td>
                      <td className="border border-gray-200 p-3"><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">View</a></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-gray-200 p-3 bg-yellow-50 text-sm">
                        <strong>⚠️ International Data Transfer Notice:</strong> Supabase&apos;s data centers are located in Singapore. Your personal information will be transferred over the internet to Singapore for storage and processing. We have entered into Data Processing Agreements (DPA) with Supabase to ensure compliance with applicable data protection standards. Supabase has obtained SOC 2 Type II and ISO 27001 certifications. By continuing to use our services, you consent to this international data transfer.
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">ByteDance (Doubao)</td>
                      <td className="border border-gray-200 p-3">AI content generation, voice synthesis</td>
                      <td className="border border-gray-200 p-3">Story descriptions, voice data (used only for current generation)</td>
                      <td className="border border-gray-200 p-3"><a href="https://www.volcengine.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">View</a></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-medium">XunhuPay</td>
                      <td className="border border-gray-200 p-3">Payment processing</td>
                      <td className="border border-gray-200 p-3">Order information, payment amounts</td>
                      <td className="border border-gray-200 p-3"><a href="https://www.xunhupay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">View</a></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">Google Analytics</td>
                      <td className="border border-gray-200 p-3">Website analytics, traffic statistics</td>
                      <td className="border border-gray-200 p-3">Access data, browsing behavior</td>
                      <td className="border border-gray-200 p-3"><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">View</a></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-medium">Clerk</td>
                      <td className="border border-gray-200 p-3">User authentication</td>
                      <td className="border border-gray-200 p-3">Email, phone number (encrypted storage)</td>
                      <td className="border border-gray-200 p-3"><a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">View</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Note:</strong> The above third-party service providers will process your information according to their respective privacy policies. We have entered into data processing agreements with these providers to ensure they implement appropriate security measures to protect your personal information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🌏</span> International Data Transfers
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Regarding international data transfers, we inform you as follows:</p>
              
              <h3 className="font-semibold text-gray-800">1. Cross-Border Transfers</h3>
              <p>Our data storage provider, Supabase, operates data centers in Singapore (Asia-Pacific region). When you use our services, your personal information (including account information and voice data) will be transmitted over the internet to servers in Singapore for storage and processing.</p>
              
              <h3 className="font-semibold text-gray-800">2. Legal Basis and Compliance Measures</h3>
              <p>We have implemented the following measures to ensure the legality of international data transfers:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We have entered into Data Processing Agreements (DPA) with Supabase, specifying the rights and obligations of both parties in data processing</li>
                <li>Supabase has obtained SOC 2 Type II and ISO 27001 certifications</li>
                <li>We ensure that data processing activities comply with applicable data protection requirements</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800">3. Your Rights and Choices</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right to be Informed:</strong> You have the right to know that your personal information will be transferred internationally and stored abroad</li>
                <li><strong>Right to Object:</strong> You have the right to object to international data transfers, though declining may prevent you from using our services</li>
                <li><strong>Continued Use Equals Consent:</strong> By continuing to use our services, you consent to the international data transfer arrangement</li>
              </ul>
              
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ Important Notice:</strong> If you do not consent to the transfer of your personal information to Singapore, please stop using our services immediately and contact us at <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a> to request account deletion.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🗑️</span> Data Retention and Deletion
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Voice Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Voice data will be retained until you actively delete it or your account is closed</li>
                <li>You may contact us at any time to request deletion of your voice data</li>
                <li>After account deletion, voice data will be deleted within 15 business days</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Account Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information is retained for the duration of your account</li>
                <li>Account information will be deleted within 30 days after account closure</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. Transaction Data</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Transaction records are retained for a minimum of 3 years in accordance with applicable financial regulations</li>
              </ul>

              <h3 className="font-semibold text-gray-800">4. Generated Content Auto-Deletion Policy</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Generated content (story text, illustrations, audio) is automatically deleted after 30 days</li>
                <li>You may download and save your stories within 30 days of generation</li>
                <li>After 30 days, the system will automatically purge this data—please save your content in a timely manner</li>
              </ul>
              <p className="bg-red-50 p-4 rounded-xl border border-red-200">
                <strong>⚠️ Please download and save your stories within 30 days of generation. After 30 days, the system will automatically purge this data.</strong>
              </p>
            </div>
          </section>

          {/* COPPA Compliance - U.S. Children's Online Privacy Protection Act */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🇺🇸</span> COPPA Compliance
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>In accordance with the U.S. Children&apos;s Online Privacy Protection Act (COPPA) and the 2026 Amendments:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>This product is designed for parental use; all operations are performed by parents and we do not directly collect personal information from children</li>
                <li>We do not collect biometric data from children (including voiceprints or facial recognition)</li>
                <li>We do not collect photos of children</li>
                <li>Disclosure of data to third parties (ByteDance/Doubao, Alibaba Cloud) requires your knowledge and separate consent—see the Third-Party Services table above</li>
                <li>Under the 2026 COPPA Amendments, biometric information constitutes &quot;personal information&quot; requiring parental consent</li>
                <li>Third-party disclosures require independent consent from parents</li>
                <li>We maintain a data retention policy with defined retention periods</li>
                <li>You may request deletion of all your child&apos;s data at any time, and we will complete such deletion within 15 business days</li>
                <li>We will not use children&apos;s data for behavioral advertising</li>
              </ul>
              <p>If you believe we have violated COPPA, you may file a complaint with the FTC: <a href="https://www.ftc.gov/complaint" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://www.ftc.gov/complaint</a></p>
            </div>
          </section>

          {/* GDPR-K Compliance - EU Children's Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🇪🇺</span> GDPR-K Compliance (EU)
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>In accordance with the General Data Protection Regulation&apos;s provisions concerning children (GDPR-K):</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Services to children under 16 require parental consent (some member states have lowered this to age 13)</li>
                <li>This product uses age-gating to verify parental identity</li>
                <li><strong>Right to be Forgotten:</strong> You may request deletion of all personal data at any time</li>
                <li><strong>Data Portability:</strong> You may request export of your data in a portable format</li>
                <li><strong>Right to Object:</strong> You may object to certain data processing activities</li>
                <li><strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with your local data protection authority</li>
                <li>We adhere to the data minimization principle, collecting only information necessary to provide our services</li>
              </ul>
            </div>
          </section>

          {/* EU AI Act Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span> AI-Generated Content Disclosure
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>In accordance with the EU Artificial Intelligence Act (EU AI Act) and applicable transparency requirements:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Story text and illustrations in this product are generated by AI; each ebook is labeled with &quot;AI-Generated Content&quot;</li>
                <li>AI-generated content is provided for entertainment purposes only and does not constitute professional advice</li>
                <li>Purely AI-generated content is not protected by copyright law; you may not claim copyright over AI-generated stories</li>
                <li>Our product design, character systems, and UI/UX are human-created works and are protected by intellectual property rights</li>
                <li>AI models used: ByteDance Doubao for story generation, Alibaba Cloud Wanxiang for illustration generation, ByteDance CosyVoice for speech synthesis</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✏️</span> Your Rights
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>Under applicable data protection laws, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Right to be Informed:</strong> Understand how we collect and use your personal information</li>
                <li><strong>Right of Access:</strong> Access the personal information we hold about you</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal information (including voice data)</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we process your personal information</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with relevant supervisory authorities</li>
              </ul>
              <p>To exercise any of these rights, please contact: <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions, comments, or suggestions regarding this Privacy Policy, please contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>Email:</strong> <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a>
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              We will respond to your feedback within 15 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
