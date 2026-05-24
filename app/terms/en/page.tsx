import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "It's Me Book Terms of Service - Usage terms and conditions",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500">Last Updated: May 17, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to It&apos;s Me Book! These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and It&apos;s Me Book regarding your use of our services. Before using our services, please carefully read all provisions of these Terms. If you do not agree with any part of these Terms, please do not register for or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Electronic Contract
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong>These Terms constitute an electronic contract.</strong> By clicking &quot;I Agree&quot; or &quot;Register,&quot; or by using our services in any manner, you acknowledge that you have fully read, understood, and agree to be bound by these Terms, which shall thereupon take legal effect.
              </p>
              <p>
                This electronic contract has the same legal effect as a written contract. You agree and acknowledge that electronic records are legally binding to the same extent as written signatures.
              </p>
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>💡 Note:</strong> You may view the historical versions of these Terms in &quot;Account Settings.&quot; If you have any questions about the Terms, please contact us before agreeing.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✅</span> Service Description
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>It&apos;s Me Book provides the following services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI Picture Book Generation — Personalized picture books generated based on your child&apos;s interests and characteristics</li>
                <li>AI Story Generation — Custom bedtime stories generated based on themes and child information</li>
                <li>AI Illustration Generation — Custom illustrations generated to accompany stories</li>
                <li>Account Management Features</li>
                <li>Related Technical Support</li>
              </ul>
              <p>
                We reserve the right to adjust, modify, or discontinue any aspect of our services at any time, with reasonable notice to users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span> Account Registration
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Account Requirements</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Must be an adult aged 18 years or older</li>
                <li>Must provide accurate and valid registration information</li>
                <li>Must keep account credentials secure</li>
                <li>Responsible for all activities under the account</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Account Security</h3>
              <p>
                You are responsible for maintaining the security of your account. If you discover any unauthorized use of your account, you should notify us immediately.
              </p>
            </div>
          </section>

          {/* Children's Privacy Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👨‍👩‍👧</span> Children&apos;s Privacy Protection
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>This product is designed for children ages 3-12 and must be operated by parents or legal guardians:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not collect biometric data or photos of children</li>
                <li>Users must confirm they are the parent or legal guardian of the child before using this product</li>
                <li>Parents may request deletion of all child-related data at any time</li>
                <li>We will not use children&apos;s data for behavioral advertising</li>
                <li>An age-gate verification of parental identity is required before using the product</li>
              </ul>
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>💡 COPPA Compliance:</strong> This product complies with the U.S. Children&apos;s Online Privacy Protection Act (COPPA) and does not directly collect personal information from children.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎤</span> Voice Recording and Usage
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>By recording your voice, you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Confirm that the recorded voice belongs to you</li>
                <li>Consent to our use of your voice to generate your personalized bedtime stories</li>
                <li>Consent to the encrypted storage processing of voice data</li>
                <li>Understand that your voice will only be used for the current story generation and will not be used to train AI models</li>
              </ul>
              <p className="bg-green-50 p-4 rounded-xl border border-green-200">
                <strong>💡 Note:</strong> You may contact us at any time to delete your voice data. After deletion, we will be unable to use that voice to generate further stories.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✨</span> AI-Generated Content
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Content Ownership</h3>
              <p>
                You understand and agree that the story content, illustrations, and audio in this product are generated by AI.
              </p>
              <p>
                <strong>Purely AI-generated content is not protected by copyright law, and you may not claim copyright over AI-generated stories.</strong> You may use AI-generated stories for personal entertainment and non-commercial purposes.
              </p>

              <h3 className="font-semibold text-gray-800">2. Content Guidelines</h3>
              <p>You must not use our AI generation services to create content that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violates laws or regulations</li>
                <li>Infringes upon the rights of others</li>
                <li>Contains pornographic, violent, or恐怖内容</li>
                <li>Contains false or misleading information</li>
                <li>Contains commercial advertising or promotional material</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. Content Disclaimer</h3>
              <p>
                AI-generated content is labeled with &quot;AI-Generated&quot; identifiers. <strong>Content is provided for entertainment purposes only and does not represent any real events or opinions, and does not constitute educational advice.</strong> AI-generated content may contain inaccuracies. It&apos;s Me Book makes no warranties regarding the accuracy, completeness, or applicability of AI-generated content.
              </p>

              <h3 className="font-semibold text-gray-800">4. Commercial Use Restrictions</h3>
              <p>
                Users must not use AI-generated content for commercial purposes or claim AI-generated content as their own original work.
              </p>

              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ Disclaimer:</strong> AI-generated story content is provided for entertainment purposes only and does not constitute professional advice (medical, educational, psychological, etc.). For professional assistance, please consult qualified professionals in the relevant field.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span> AI Service Special Terms
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>Legal Basis:</strong> These terms are established in accordance with applicable regulations governing generative AI services.
              </p>
              
              <h3 className="font-semibold text-gray-800">1. AI Model Disclosure</h3>
              <p>
                AI generation models used by It&apos;s Me Book are provided by <strong>ByteDance</strong>. We partner with ByteDance to provide you with advanced voice synthesis and image generation services.
              </p>

              <h3 className="font-semibold text-gray-800">2. Generated Content Disclosure</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI-generated content may contain inaccuracies, biases, or fictional elements</li>
                <li>AI-generated content does not constitute professional advice (medical, legal, financial, educational, etc.)</li>
                <li>AI-generated content is provided for entertainment purposes only and should not be used as a basis for factual decisions</li>
                <li>We make no express or implied warranties regarding the accuracy, completeness, or reliability of AI-generated content</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. User Obligations</h3>
              <p>You must not use our services to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Generate content that violates laws or regulations</li>
                <li>Generate content that infringes upon the legitimate rights of others</li>
                <li>Generate false information or rumors</li>
                <li>Generate content that threatens national security or public interests</li>
                <li>Use our services to train or improve AI models</li>
              </ul>

              <h3 className="font-semibold text-gray-800">4. Content Review and Actions</h3>
              <p>
                We reserve the right to review AI-generated content. If we discover illegal content or suspected illegal content, we reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Suspend or terminate services to you</li>
                <li>Preserve relevant records and report to competent authorities</li>
                <li>Take necessary technical measures to prevent the spread of illegal content</li>
              </ul>

              <h3 className="font-semibold text-gray-800">5. Safety Assessments</h3>
              <p>
                We commit to conducting necessary safety assessments of generated content in accordance with applicable regulations and maintaining robust complaint and reporting mechanisms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💎</span> Intellectual Property
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. User-Generated Content</h3>
              <p>
                <strong>Copyright in bedtime stories generated using our services (including story text and illustrations) belongs to the user.</strong> Users have the right to freely use, share, print, and make commercial use of generated content.
              </p>
              <p className="mt-2">
                <strong>User License:</strong> Users grant us a non-exclusive license to display and store generated content so that we can provide services and backup data. This license does not affect the user&apos;s ownership of generated content.
              </p>

              <h3 className="font-semibold text-gray-800">2. Platform Content and Rights</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Website design, layout, icons, and other elements are protected by copyright law</li>
                <li>It&apos;s Me Book trademarks and brand names are legally protected</li>
                <li>Users must not copy, modify, or commercially use platform content</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> Paid Services and Refunds
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Subscription and Purchase Options</h3>
              <p>
                We offer subscription plans and one-time purchase options. Pricing starts at <strong>$4.99 per book</strong>. Subscription fees will be automatically renewed based on your selected plan unless cancelled.
              </p>

              <h3 className="font-semibold text-gray-800">2. Automatic Renewal</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Subscriptions will be automatically renewed within 24 hours before the end of the current period</li>
                <li>We will send reminder notifications before renewal</li>
                <li>If you wish to cancel, please cancel before the end of the current period</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. Refund Policy</h3>
              <p>
                Since AI content generation produces digital goods, refunds are not available once generation is complete. For our detailed refund policy, please refer to our Refund Policy page.
              </p>

              <h3 className="font-semibold text-gray-800">4. Price Adjustments</h3>
              <p>
                We reserve the right to adjust service prices. We will provide reasonable notice before any price changes take effect.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> Disclaimer and Limitation of Liability
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="bg-red-50 p-4 rounded-xl border border-red-200">
                <strong>Important:</strong> To the maximum extent permitted by applicable law, It&apos;s Me Book shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Service interruptions or data loss caused by the user&apos;s own actions</li>
                <li>Losses caused by third parties (including but not limited to network failures, server failures)</li>
                <li>Any consequences arising from the user&apos;s use of AI-generated content</li>
                <li>Inaccuracies or incompleteness of AI-generated content</li>
                <li>Losses caused by unauthorized account access (if the user failed to keep passwords secure)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔧</span> Service Changes and Termination
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. Service Changes</h3>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
              </p>

              <h3 className="font-semibold text-gray-800">2. Account Termination</h3>
              <p>
                If a user violates these Terms, we reserve the right to suspend or terminate the user&apos;s account.
              </p>

              <h3 className="font-semibold text-gray-800">3. Data Retention</h3>
              <p>
                After account termination, we reserve the right to retain necessary data in accordance with applicable laws and regulations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📜</span> Terms Modification
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. Modified Terms will be posted on our website. Your continued use of our services constitutes your acceptance of the modified Terms.
              </p>
              <p>
                For significant changes (such as those affecting service fees or user rights), we will provide reasonable advance notice to users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏛️</span> Governing Law and Dispute Resolution
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, United States of America, without regard to its conflict of law provisions.
              </p>
              <p>
                <strong>For EU Users:</strong> If you are located in the European Union, these Terms shall also comply with the General Data Protection Regulation (GDPR). Nothing in these Terms shall limit any rights you have under applicable consumer protection laws.
              </p>
              <p>
                Any disputes arising out of or relating to these Terms shall first be resolved through good-faith negotiations. If negotiations fail, disputes shall be finally resolved through binding arbitration administered by the International Chamber of Commerce (ICC) in Singapore, in accordance with ICC Arbitration Rules. The arbitration shall be conducted in English.
              </p>
              <p>
                Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>Email:</strong> <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
