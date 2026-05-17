import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie政策",
  description: "是我呀 Cookie政策，了解我们如何使用Cookie和类似技术",
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie政策</h1>
          <p className="text-gray-500">最后更新日期：2026年5月16日</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 政策说明
            </h2>
            <p className="text-gray-600 leading-relaxed">
              "是我呀"（以下简称"我们"）使用Cookie和类似技术来提升您的使用体验。本Cookie政策依据《中华人民共和国个人信息保护法》的相关规定制定，旨在向您说明我们使用Cookie的类型、用途以及您如何管理Cookie设置。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>什么是Cookie？</strong>Cookie是一种由网页浏览器存储在您设备上的小型文本文件，用于记住您的偏好设置、登录状态和其他信息。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🍪</span> Cookie类型说明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <span>✅</span> 必要性Cookie
                </h3>
                <p className="mb-2">
                  <strong>说明：</strong>这些Cookie对于网站的正常运行必不可少，无法禁用。
                </p>
                <p className="mb-2"><strong>用途：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-green-700">
                  <li>保持您的登录状态</li>
                  <li>记住您的偏好设置（如语言、主题等）</li>
                  <li>确保网站安全性</li>
                  <li>支持正常的支付功能</li>
                </ul>
                <p className="mt-2 text-sm"><strong>示例：</strong>会话Cookie、身份验证Cookie、安全Cookie</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <span>⚙️</span> 功能性Cookie
                </h3>
                <p className="mb-2">
                  <strong>说明：</strong>这些Cookie用于提供更个性化的功能，可以根据您的选择启用或禁用。
                </p>
                <p className="mb-2"><strong>用途：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700">
                  <li>记住您的浏览历史和偏好</li>
                  <li>保存您的草稿内容</li>
                  <li>提供个性化的用户体验</li>
                  <li>支持多语言切换</li>
                </ul>
                <p className="mt-2 text-sm"><strong>示例：</strong>语言偏好Cookie、主题设置Cookie、记忆功能Cookie</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                  <span>📊</span> 分析性Cookie
                </h3>
                <p className="mb-2">
                  <strong>说明：</strong>这些Cookie帮助我们了解用户如何与网站互动，以便我们优化服务。
                </p>
                <p className="mb-2"><strong>用途：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-purple-700">
                  <li>分析网站流量和使用情况</li>
                  <li>了解用户行为和偏好</li>
                  <li>识别网站错误和性能问题</li>
                  <li>帮助我们改进服务质量</li>
                </ul>
                <p className="mt-2 text-sm"><strong>示例：</strong>统计Cookie、性能监控Cookie、用户路径分析Cookie</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <span>🎯</span> 营销性Cookie（如有）
                </h3>
                <p className="mb-2">
                  <strong>说明：</strong>这些Cookie用于向您展示相关的广告和内容。
                </p>
                <p className="mb-2"><strong>用途：</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-orange-700">
                  <li>显示个性化的广告</li>
                  <li>评估广告效果</li>
                  <li>限制广告展示频率</li>
                </ul>
                <p className="mt-2 text-sm"><strong>注：</strong>我们目前不使用营销性Cookie</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> 我们使用的具体Cookie
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">Cookie名称</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">类型</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">用途</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">有效期</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__session</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">必要性</span></td>
                      <td className="border border-gray-200 p-3">保持用户会话状态</td>
                      <td className="border border-gray-200 p-3">会话结束</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-mono text-sm">__remember_user</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">功能性</span></td>
                      <td className="border border-gray-200 p-3">记住登录状态</td>
                      <td className="border border-gray-200 p-3">30天</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__clerk_db_jwt</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">必要性</span></td>
                      <td className="border border-gray-200 p-3">Clerk身份验证</td>
                      <td className="border border-gray-200 p-3">会话结束</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-mono text-sm">__supabase_auth</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">必要性</span></td>
                      <td className="border border-gray-200 p-3">Supabase数据访问认证</td>
                      <td className="border border-gray-200 p-3">1小时</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__theme_preference</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">功能性</span></td>
                      <td className="border border-gray-200 p-3">记住主题偏好</td>
                      <td className="border border-gray-200 p-3">1年</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-mono text-sm">__hstc (百度统计)</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">分析性</span></td>
                      <td className="border border-gray-200 p-3">网站流量统计分析</td>
                      <td className="border border-gray-200 p-3">180天</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-mono text-sm">__baidu_id (百度统计)</td>
                      <td className="border border-gray-200 p-3"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">分析性</span></td>
                      <td className="border border-gray-200 p-3">识别唯一访客</td>
                      <td className="border border-gray-200 p-3">1年</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> 第三方Cookie说明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>以下第三方服务会在我们的网站上设置Cookie：</p>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">百度统计 (Baidu Analytics)</h3>
                <p className="mb-2"><strong>服务商：</strong>百度在线网络技术（北京）有限公司</p>
                <p className="mb-2"><strong>用途：</strong>网站流量统计分析，了解用户访问行为</p>
                <p className="mb-2"><strong>收集信息：</strong>访问时间、访问页面、停留时间、设备信息、IP地址等</p>
                <p className="mb-2"><strong>隐私政策：</strong><a href="https://tongji.baidu.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://tongji.baidu.com/privacy</a></p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Clerk (用户认证)</h3>
                <p className="mb-2"><strong>服务商：</strong>Clerk.com</p>
                <p className="mb-2"><strong>用途：</strong>用户注册、登录和身份认证</p>
                <p className="mb-2"><strong>收集信息：</strong>邮箱地址、密码（加密存储）、OAuth信息（如适用）</p>
                <p className="mb-2"><strong>隐私政策：</strong><a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://clerk.com/privacy</a></p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Supabase (数据存储)</h3>
                <p className="mb-2"><strong>服务商：</strong>Supabase, Inc.</p>
                <p className="mb-2"><strong>用途：</strong>用户数据和文件存储</p>
                <p className="mb-2"><strong>收集信息：</strong>用户账户信息、上传的照片、生成的绘本内容</p>
                <p className="mb-2"><strong>隐私政策：</strong><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">https://supabase.com/privacy</a></p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                <p className="text-yellow-800">
                  <strong>⚠️ 第三方Cookie不受我们控制：</strong>上述第三方服务的Cookie使用由相应的第三方负责。我们建议您查阅相关第三方的隐私政策，了解他们如何使用Cookie和您的信息。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span> 如何管理Cookie
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>您可以通过以下方式管理Cookie设置：</p>

              <h3 className="font-semibold text-gray-800">1. 浏览器设置</h3>
              <p>大多数网页浏览器都允许您通过设置管理Cookie：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Chrome：</strong>设置 → 隐私和安全 → Cookie和其他网站数据</li>
                <li><strong>Safari：</strong>偏好设置 → 隐私 → Cookie和网站数据</li>
                <li><strong>Firefox：</strong>选项 → 隐私与安全 → Cookie和网站数据</li>
                <li><strong>Edge：</strong>设置 → Cookie和网站权限 → 管理和删除Cookie</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">请查阅您的浏览器帮助文档了解详细操作方法</p>

              <h3 className="font-semibold text-gray-800">2. 禁用特定Cookie</h3>
              <p>您可以根据Cookie类型选择性地禁用：</p>
              <div className="grid gap-3 mt-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" checked disabled className="w-5 h-5 rounded text-primary-orange" />
                  <div>
                    <p className="font-medium text-gray-900">必要性Cookie</p>
                    <p className="text-sm text-gray-500">无法禁用（网站正常运行必需）</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" id="functional-cookies" className="w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange" />
                  <div>
                    <p className="font-medium text-gray-900">功能性Cookie</p>
                    <p className="text-sm text-gray-500">可选择性禁用，禁用后部分功能可能不可用</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" id="analytics-cookies" className="w-5 h-5 rounded border-gray-300 text-primary-orange focus:ring-primary-orange" />
                  <div>
                    <p className="font-medium text-gray-900">分析性Cookie</p>
                    <p className="text-sm text-gray-500">可选择性禁用，禁用后不影响核心功能</p>
                  </div>
                </label>
              </div>

              <h3 className="font-semibold text-gray-800">3. 退出百度统计</h3>
              <p>如需退出百度统计的数据收集，您可以：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>安装百度统计提供的<a href="https://tongji.baidu.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">退出浏览器插件</a></li>
                <li>或者点击<a href="javascript:void(0)" className="text-primary-orange hover:underline">退出百度统计追踪</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 禁用Cookie的后果
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>如果您禁用Cookie，可能会产生以下影响：</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-semibold text-red-800 mb-2">可能导致的问题</p>
                  <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                    <li>无法保持登录状态，每次需重新登录</li>
                    <li>无法记住偏好设置（如语言、主题）</li>
                    <li>部分表单需重新填写</li>
                    <li>用户体验可能下降</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">不受影响的功能</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                    <li>核心绘本生成功能</li>
                    <li>照片上传和处理</li>
                    <li>支付功能</li>
                    <li>基本的浏览和阅读功能</li>
                  </ul>
                </div>
              </div>

              <p className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <strong>💡 建议：</strong>如果您希望获得最佳的使用体验，建议您启用功能性Cookie和分析性Cookie。您可以随时通过浏览器设置清除所有Cookie。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔄</span> 政策更新
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能会不时更新本Cookie政策，以反映服务变化或法律法规的要求。更新时我们会修改"最后更新日期"。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              如我们对Cookie的使用方式做出重大变更，我们将通过网站公告或弹窗通知的方式提前告知您。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              如您对本Cookie政策有任何疑问，请通过以下方式联系我们：
            </p>
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
