import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "It's Me Book Refund Policy - Learn about our refund conditions and process",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-gray-500">Last Updated: May 16, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Policy Overview
            </h2>
            <p className="text-gray-600 leading-relaxed">
              It&apos;s Me Book (hereinafter referred to as &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to providing an excellent user experience. This Refund Policy is developed in accordance with consumer protection regulations applicable to our users, including but not limited to the EU Consumer Rights Directive (2011/83/EU), the UK Consumer Rights Act 2015, and the US Federal Trade Commission (FTC) Cooling-Off Rule, to protect your legitimate rights and interests.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>Important Notice:</strong> AI-generated storybooks are considered digital goods/digital content. In accordance with applicable consumer protection laws, certain situations may not be eligible for no-reason returns. Please read the following refund policy carefully.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span> Eligible Refund Situations
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">✅ Situations Where Refunds Are Supported</h3>
              <div className="grid gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">Situation 1: Payment Completed but Generation Not Started</p>
                  <p>If you have completed payment but the AI storybook has not yet started generating, you may apply for a full refund.</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">Situation 2: System Failure During Generation</p>
                  <p>If generation fails or cannot be completed due to our system failure or technical issues, you may apply for a full refund.</p>
                  <p className="text-sm mt-2 text-green-700">Note: Screenshots or supporting documentation may be required</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">Situation 3: Duplicate Charges</p>
                  <p>If the same order was charged multiple times due to system issues or operational errors, we will refund the duplicate amount.</p>
                  <p className="text-sm mt-2 text-green-700">Note: Payment record screenshots may be required</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-semibold text-blue-800 mb-2">Situation 4: Special Circumstances for Negotiation</p>
                  <p>For the following situations, you may contact us to negotiate a refund:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-blue-700">
                    <li>Unable to use the service due to force majeure (e.g., sudden illness, emergency)</li>
                    <li>Severe dissatisfaction with the generated result (detailed explanation required)</li>
                    <li>Other special reasons deemed reasonable upon our assessment</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mt-6">❌ Situations Where Refunds Are Not Supported</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-semibold text-red-800 mb-2">AI-generated content is considered digital goods, and the following special provisions apply:</p>
                <ul className="list-disc list-inside space-y-2 text-red-700">
                  <li>Under EU Consumer Rights Directive (2011/83/EU) Article 16, digital content may not be eligible for the 14-day withdrawal right once download or streaming has begun with your explicit consent</li>
                  <li><strong>Completed storybooks</strong> are not eligible for refunds (digital goods are considered delivered once used)</li>
                  <li>Refunds requested due to user&apos;s own reasons (e.g., accidental purchase, change of mind)</li>
                  <li>Accounts terminated due to violations of Terms of Service</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span> Refund Scenario Classification
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">Scenario</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Refund Amount</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">Payment completed, generation not started</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">Full Refund</td>
                      <td className="border border-gray-200 p-3">Immediate processing</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">System failure during generation</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">Full Refund</td>
                      <td className="border border-gray-200 p-3">Screenshot proof required</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Generation failed (system cause)</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">Full Refund</td>
                      <td className="border border-gray-200 p-3">Automatic or manual processing</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Generation completed</td>
                      <td className="border border-gray-200 p-3 text-red-600 font-semibold">Not Supported</td>
                      <td className="border border-gray-200 p-3">Negotiable but not guaranteed</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">Duplicate charges</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">Full Refund</td>
                      <td className="border border-gray-200 p-3">Payment record required</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Accidental purchase / Change of mind</td>
                      <td className="border border-gray-200 p-3 text-red-600 font-semibold">Not Supported</td>
                      <td className="border border-gray-200 p-3">Digital goods not eligible once used</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> Refund Application Process
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>If you need to apply for a refund, please follow these steps:</p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Prepare Refund Application Materials</p>
                    <p className="text-sm">Including: Order number, payment proof, problem description (if any)</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Contact Customer Support</p>
                    <p className="text-sm">Send email to: <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a></p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Wait for Review</p>
                    <p className="text-sm">We will complete the review within 1-5 business days</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <p className="font-semibold text-gray-900">Refund Processed</p>
                    <p className="text-sm">After approval, the refund will be returned to your original payment method within 3-7 business days</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="font-semibold text-blue-800 mb-2">📧 Refund Request Email Template</p>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-600 font-mono">
                  <p><strong>Subject:</strong> Refund Request - Order [Please Fill In]</p>
                  <p className="mt-2"><strong>Body:</strong></p>
                  <p>Hello,</p>
                  <p className="mt-1">Order Number: [Please Fill In]</p>
                  <p>Reason for Refund: [Please Fill In]</p>
                  <p>Payment Amount: [Please Fill In] USD</p>
                  <p>Payment Method: [Please Fill In] (Credit Card / Creem / Other)</p>
                  <p className="mt-1">Attachment: Payment screenshot</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⏱️</span> Refund Processing Timeline
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">Review Timeline</p>
                  <p className="text-2xl font-bold text-primary-orange">1-5 Business Days</p>
                  <p className="text-sm text-gray-500 mt-1">We will complete the review as soon as possible after receiving your refund application</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">Refund to Account</p>
                  <p className="text-2xl font-bold text-primary-orange">3-7 Business Days</p>
                  <p className="text-sm text-gray-500 mt-1">After approval, the refund will be returned to your original payment method</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                <strong>Note:</strong> The actual time for the refund to reach your account may vary depending on payment channels and bank processing times. If you have not received the refund after 7 business days, please contact us for inquiry.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> Refund Methods
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>We use the <strong>original payment method</strong> for refunds:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Credit Card:</strong> Refund will be returned to your credit card</li>
                <li><strong>Creem Payment:</strong> Refund will be returned to your Creem account</li>
                <li><strong>Other Payment Methods:</strong> Refund method will be determined based on the actual payment channel</li>
              </ul>
              <p className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <strong>⚠️ Note:</strong> Refunds can only be returned to your original payment account. Refund to a different account is not supported. If you have special circumstances, please contact customer support.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📅</span> Subscription/Membership Refund Rules
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>For monthly, quarterly, annual subscriptions and other membership services, we have established the following refund rules:</p>
              
              <h3 className="font-semibold text-gray-800">1. Unused Subscription</h3>
              <p>If you purchased a subscription but have not used any services yet, you may apply for a full refund.</p>

              <h3 className="font-semibold text-gray-800">2. Partially Used Subscription</h3>
              <p>The refund amount will be calculated using the following formula:</p>
              <div className="bg-gray-50 rounded-xl p-4 my-4">
                <p className="font-mono text-center">
                  <strong>Refund Amount = Actual Payment - (Days Used × Daily Rate)</strong>
                </p>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Daily Rate = Actual Payment Amount ÷ Total Subscription Days
                </p>
              </div>

              <h3 className="font-semibold text-gray-800">3. Auto-Renewal Subscriptions</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>If you need to cancel auto-renewal, please do so at least 24 hours before the current subscription period ends</li>
                <li>If you apply for a refund after being charged, the services already enjoyed will not be refunded</li>
                <li>After canceling auto-renewal, you can continue to use the services within the current subscription period</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="font-semibold text-blue-800 mb-2">💡 How to Cancel Auto-Renewal</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Log in to your account</li>
                  <li>Go to &quot;Account Settings&quot; or &quot;Subscription Management&quot;</li>
                  <li>Find the &quot;Auto-Renewal&quot; option and turn it off</li>
                  <li>Or contact us to cancel at least 24 hours before subscription expiration</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>❓</span> Frequently Asked Questions
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="space-y-3">
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: Can I get a refund if generation fails?</summary>
                  <p className="mt-2 text-gray-600">A: If the failure is due to our system malfunction or technical issues, you may apply for a full refund. Please provide relevant screenshots or error messages so we can verify and process your request.</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: Can I get a refund if I&apos;m not satisfied with the result?</summary>
                  <p className="mt-2 text-gray-600">A: AI-generated content has inherent subjectivity and variability. Dissatisfaction with the result that does not constitute a quality issue is generally not covered by refunds. However, if you believe there is a serious problem, please contact us to negotiate a solution.</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: How long does it take for the refund to arrive?</summary>
                  <p className="mt-2 text-gray-600">A: We commit to completing the review within 1-5 business days. After approval, the refund will be processed within 3-7 business days. The actual arrival time depends on the payment channel and bank processing speed.</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: Can the refund be sent to a different account?</summary>
                  <p className="mt-2 text-gray-600">A: To ensure fund security, refunds can only be returned to your original payment account via the original payment method. If you have special circumstances, please contact customer support.</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: How do I contact customer support for a refund?</summary>
                  <p className="mt-2 text-gray-600">A: You can contact us through the following method:<br/>📧 Email: haimozhouqiu@outlook.com</p>
                </details>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about refunds, please contact us through the following method:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>Email:</strong> <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a>
              </p>
              <p className="text-gray-600">
                <strong>Business Hours:</strong> Monday to Friday, 9:00 AM - 6:00 PM (excluding public holidays)
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              We will process your refund application as soon as possible after receiving your inquiry. In case of any disputes, we will protect your legitimate rights and interests in accordance with applicable laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
