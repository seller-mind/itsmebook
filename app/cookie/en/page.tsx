import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "It's Me Book Cookie Policy - Learn how we use cookies and similar technologies",
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-500">Last Updated: May 17, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Policy Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              It&apos;s Me Book (hereinafter referred to as &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) uses cookies and similar technologies to enhance your experience on our website and application. This Cookie Policy is developed in accordance with the ePrivacy Directive (2002/58/EC) and the General Data Protection Regulation (GDPR), explaining the types of cookies we use, their purposes, and how you can manage your cookie preferences.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>What are Cookies?</strong> Cookies are small text files stored on your device by your web browser. They are used to remember your preferences, login status, and other information to provide a better browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🍪</span> Types of Cookies We Use
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <span>✅</span> Strictly Necessary Cookies
                </h3>
                <p className="mb-2">
                  <strong>Description:</strong> These cookies are essential for the website to function properly. They cannot be disabled.
                </p>
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-green-700">
                  <li>Maintaining your login session</li>
                  <li>Remembering your preferences (language, theme, etc.)</li>
                  <li>Ensuring website security</li>
                  <li>Enabling payment processing</li>
                </ul>
                <p className="mt-2 text-sm"><strong>Examples:</strong> Session cookies, authentication cookies, security cookies</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <span>⚙️</span> Functional Cookies
                </h3>
                <p className="mb-2">
                  <strong>Description:</strong> These cookies provide enhanced, personalized features and can be enabled or disabled based on your preferences.
                </p>
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700">
                  <li>Remembering your browsing history and preferences</li>
                  <li>Saving your story drafts</li>
                  <li>Providing personalized user experience</li>
                  <li>Supporting multi-language switching</li>
                </ul>
                <p className="mt-2 text-sm"><strong>Examples:</strong> Language preference cookies, theme setting cookies, memory cookies</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <span>📊</span> Analytics Cookies
                </h3>
                <p className="mb-2">
                  <strong>Description:</strong> These cookies help us understand how users interact with our website so we can improve our services.
                </p>
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-purple-700">
                  <li>Analyzing website traffic and usage patterns</li>
                  <li>Understanding user behavior and preferences</li>
                  <li>Identifying website errors and performance issues</li>
                  <li>Helping us improve service quality</li>
                </ul>
                <p className="mt-2 text-sm"><strong>Examples:</strong> Statistical cookies, performance monitoring cookies, user path analysis cookies</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <span>🎯</span> Marketing Cookies (if applicable)
                </h3>
                <p className="mb-2">
                  <strong>Description:</strong> These cookies are used to deliver relevant advertisements and content to you.
                </p>
                <p className="mb-2"><strong>Purpose:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-orange-700">
                  <li>Displaying personalized advertisements</li>
                  <li>Measuring advertising effectiveness</li>
                  <li>Limiting ad frequency</li>
                </ul>
                <p className="mt-2 text-sm"><strong>Note:</strong> We currently do not use marketing cookies</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Specific Cookies We Use
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">Cookie Name</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Type</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Purpose</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__session</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Strictly Necessary</span></td>
                      <td className="border border-gray-200 p-3">Maintaining user session state</td>
                      <td className="border border-gray-200 p-3">Session</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-mono text-sm">__remember_user</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Functional</span></td>
                      <td className="border border-gray-200 p-3">Remembering login state</td>
                      <td className="border border-gray-200 p-3">30 days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__clerk_db_jwt</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Strictly Necessary</span></td>
                      <td className="border border-gray-200 p-3">Clerk authentication</td>
                      <td className="border border-gray-200 p-3">Session</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-mono text-sm">__supabase_auth</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Strictly Necessary</span></td>
                      <td className="border border-gray-200 p-3">Supabase data access authentication</td>
                      <td className="border border-gray-200 p-3">1 hour</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__theme_preference</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Functional</span></td>
                      <td className="border border-gray-200 p-3">Remembering theme preferences</td>
                      <td className="border border-gray-200 p-3">1 year</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-mono text-sm">_ga / _gid (Google Analytics)</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Analytics</span></td>
                      <td className="border border-gray-200 p-3">Website traffic analytics (if applicable)</td>
                      <td className="border border-gray-200 p-3">2 years / 24 hours</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">_gat (Google Analytics)</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Analytics</span></td>
                      <td className="border border-gray-200 p-3">Request rate throttling (if applicable)</td>
                      <td className="border border-gray-200 p-3">1 minute</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> Third-Party Cookies
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>The following third-party services may set cookies on our website:</p>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Google Analytics (if applicable)</h3>
                <p className="mb-2"><strong>Provider:</strong> Google LLC</p>
                <p className="mb-2"><strong>Purpose:</strong> Website traffic analytics and user behavior analysis</p>
                <p className="mb-2"><strong>Data Collected:</strong> Visit time, pages viewed, dwell time, device information, IP address, etc.</p>
                <p className="mb-2"><strong>Privacy Policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://policies.google.com/privacy</a></p>
                <p className="mb-2"><strong>Opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">Google Analytics Opt-out Browser Add-on</a></p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Clerk (User Authentication)</h3>
                <p className="mb-2"><strong>Provider:</strong> Clerk.com, Inc.</p>
                <p className="mb-2"><strong>Purpose:</strong> User registration, login, and identity authentication</p>
                <p className="mb-2"><strong>Data Collected:</strong> Email address, password (encrypted storage), OAuth information (if applicable)</p>
                <p className="mb-2"><strong>Privacy Policy:</strong> <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://clerk.com/privacy</a></p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Supabase (Data Storage)</h3>
                <p className="mb-2"><strong>Provider:</strong> Supabase, Inc.</p>
                <p className="mb-2"><strong>Purpose:</strong> User data and story content storage</p>
                <p className="mb-2"><strong>Data Collected:</strong> User account information, voice data (encrypted), generated story content</p>
                <p className="mb-2"><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://supabase.com/privacy</a></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚖️</span> GDPR &amp; Cookie Consent
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Under the General Data Protection Regulation (GDPR) and the ePrivacy Directive, we are required to obtain your explicit consent before placing non-essential cookies on your device. When you first visit our website, you will be presented with a cookie consent banner that allows you to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Accept all cookies</strong> - Enable all cookie categories</li>
                <li><strong>Reject non-essential cookies</strong> - Only strictly necessary cookies will be placed</li>
                <li><strong>Customize preferences</strong> - Choose which categories of cookies you consent to</li>
              </ul>
              <p className="mt-4">
                You may withdraw your consent at any time by accessing your cookie preferences through our Cookie Settings page or by clearing your browser cookies.
              </p>
              <p className="mt-4">
                <strong>Legal Basis:</strong> For strictly necessary cookies, our legal basis for processing is legitimate interest (Article 6(1)(f) GDPR). For functional, analytics, and marketing cookies, our legal basis is your consent (Article 6(1)(a) GDPR).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span> Managing Your Cookie Preferences
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>You can manage your cookie settings through the following methods:</p>
              
              <h3 className="font-semibold text-gray-800">1. Browser Settings</h3>
              <p>
                Most browsers allow you to block cookies, delete existing cookies, or only accept certain cookies. You can adjust these settings in your browser:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Firefox:</strong> Options → Privacy &amp; Security → Cookies and Site Data</li>
                <li><strong>Edge:</strong> Settings → Cookie and site permissions → Manage and delete cookies</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. Logging Out</h3>
              <p>
                After logging out, we will delete cookies associated with your account.
              </p>

              <h3 className="font-semibold text-gray-800">3. Third-Party Cookie Opt-Out</h3>
              <p>
                To opt out of Google Analytics tracking, you can install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>

              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ Important:</strong> Disabling certain cookies may affect website functionality. For example, you may not be able to stay logged in or have your preferences remembered.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Cookie Policy, please contact us:
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
