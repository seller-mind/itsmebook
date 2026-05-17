import { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "是我呀隐私政策，了解我们如何保护您的个人信息",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">隐私政策</h1>
          <p className="text-gray-500">最后更新日期：2026年5月17日</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 概述
            </h2>
            <p className="text-gray-600 leading-relaxed">
              "是我呀"（以下简称"我们"）非常重视用户的隐私和个人信息保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息，以及您享有的相关权利。请您在使用我们的服务前，仔细阅读并了解本隐私政策。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>特别提示：</strong>我们仅收集您的声音用于故事生成，<strong>不收集、不存储儿童照片</strong>。如果您是14周岁以下儿童的监护人，请同时阅读我们的《儿童隐私政策》以了解我们如何专门保护儿童个人信息。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚖️</span> 法律依据
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们处理您的个人信息依据以下法律条款：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>《中华人民共和国个人信息保护法》第十三条：</strong>取得个人的同意</li>
                <li><strong>合同履行：</strong>当您购买我们的服务时，我们需要处理您的信息以履行合同义务</li>
                <li><strong>法定义务：</strong>根据法律法规的要求，我们需要保留某些数据（如订单记录）</li>
                <li><strong>合法权益：</strong>为保护我们的网络安全和防止欺诈，我们可能会处理必要的信息</li>
              </ul>
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>💡 说明：</strong>我们只会在有合法依据的情况下处理您的个人信息，并根据最小必要原则只收集提供服务所必需的信息。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> 信息收集
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 您主动提供的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>声音录音：</strong>您在录制页面录制的声音样本，用于AI声音克隆和故事生成。声音数据仅用于生成您的专属睡前故事，不会用于其他目的。</li>
                <li>账户信息：注册时提供的邮箱、手机号等</li>
                <li>故事偏好：选择的故事主题、孩子的名字等信息</li>
                <li>反馈信息：您向我们提供的建议或反馈</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 自动收集的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>设备信息：设备类型、操作系统等</li>
                <li>使用数据：功能使用情况、生成记录等</li>
                <li>日志信息：访问时间、浏览记录等</li>
                <li>Cookie信息：访问偏好、登录状态等</li>
              </ul>

              <h3 className="font-semibold text-gray-800 font-bold text-green-700">🚫 我们不收集的信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 text-green-600">
                <li><strong>我们不收集用户照片或儿童照片</strong></li>
                <li><strong>我们不收集精确地理位置</strong></li>
                <li><strong>我们不收集通讯录信息</strong></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎤</span> 声音数据特别说明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们非常重视您的声音数据安全，采取以下保护措施：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>仅用于故事生成：</strong>您的声音数据仅用于生成您的专属睡前故事，不会用于训练AI模型</li>
                <li><strong>加密存储：</strong>声音数据采用AES-256加密存储</li>
                <li><strong>可随时删除：</strong>您可以随时联系客服删除您的声音数据</li>
                <li><strong>不共享给第三方：</strong>您的声音数据不会出售或共享给任何第三方</li>
                <li><strong>本地优先：</strong>部分处理在本地设备完成，减少数据传输</li>
              </ul>
              <p className="bg-green-50 p-4 rounded-xl border border-green-200">
                <strong>💡 您的权利：</strong>您拥有您声音数据的完全控制权，可以随时要求删除。删除后，我们将无法恢复您的声音克隆数据。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔐</span> 信息保护
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们采取多种安全措施保护您的信息安全：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>传输加密：使用HTTPS/TLS加密传输所有数据</li>
                <li>存储加密：敏感信息采用AES-256加密存储</li>
                <li>访问控制：严格限制员工访问权限</li>
                <li>定期审计：定期进行安全审查和漏洞扫描</li>
                <li>数据备份：定期备份防止数据丢失</li>
                <li>最小化原则：只收集提供服务所必需的最少信息</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> 第三方SDK及服务商
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们使用以下第三方服务提供商来支持我们的服务：</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">服务商</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">用途</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">收集信息</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">隐私政策</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3 font-medium">Supabase</td>
                      <td className="border border-gray-200 p-3">数据存储、用户数据管理</td>
                      <td className="border border-gray-200 p-3">用户账户数据、声音数据（加密）、生成内容</td>
                      <td className="border border-gray-200 p-3"><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">查看</a></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-gray-200 p-3 bg-yellow-50 text-sm">
                        <strong>⚠️ 数据跨境传输说明：</strong>Supabase数据中心位于新加坡，您的个人信息将通过互联网传输至新加坡存储。我们已按照《中华人民共和国个人信息保护法》第三十八条的规定，与Supabase签署数据处理协议（DPA），确保数据处理符合相关安全标准。Supabase已通过SOC 2 Type II、ISO 27001等国际安全认证。您继续使用本服务即表示同意数据跨境传输。如您不同意，可在账户设置中注销账户以停止数据处理。
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">火山引擎（豆包）</td>
                      <td className="border border-gray-200 p-3">AI内容生成、声音克隆</td>
                      <td className="border border-gray-200 p-3">故事描述、声音数据（仅用于本次生成）</td>
                      <td className="border border-gray-200 p-3"><a href="https://www.volcengine.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">查看</a></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-medium">虎皮椒</td>
                      <td className="border border-gray-200 p-3">支付处理</td>
                      <td className="border border-gray-200 p-3">订单信息、支付金额</td>
                      <td className="border border-gray-200 p-3"><a href="https://www.xunhupay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">查看</a></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">百度统计</td>
                      <td className="border border-gray-200 p-3">网站分析、流量统计</td>
                      <td className="border border-gray-200 p-3">访问数据、浏览行为</td>
                      <td className="border border-gray-200 p-3"><a href="https://tongji.baidu.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">查看</a></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3 font-medium">Clerk</td>
                      <td className="border border-gray-200 p-3">用户认证</td>
                      <td className="border border-gray-200 p-3">邮箱、手机号（加密存储）</td>
                      <td className="border border-gray-200 p-3"><a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">查看</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                <strong>说明：</strong>上述第三方服务商将根据其隐私政策处理您的信息。我们会与这些服务商签订数据处理协议，确保他们采取适当的安全措施来保护您的个人信息。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🌏</span> 数据跨境传输
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>根据《中华人民共和国个人信息保护法》的相关规定，我们就数据跨境传输向您说明如下：</p>
              
              <h3 className="font-semibold text-gray-800">1. 跨境传输情况</h3>
              <p>我们的数据存储服务商Supabase的数据中心位于新加坡（亚太地区）。当您使用我们的服务时，您的个人信息（包括账户信息和声音数据）将通过互联网传输至新加坡的服务器进行存储和处理。</p>
              
              <h3 className="font-semibold text-gray-800">2. 法律依据与合规措施</h3>
              <p>我们已按照《个人信息保护法》第三十八条的规定，采取以下措施确保数据跨境传输的合法性：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>与Supabase签署数据处理协议（DPA），明确双方在数据处理中的权利和义务</li>
                <li>Supabase已通过SOC 2 Type II、ISO 27001等国际安全认证</li>
                <li>确保数据处理活动符合中国个人信息保护相关法律法规的要求</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800">3. 您的权利与选择</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>知情权：</strong>您有权了解您的个人信息将被跨境传输及存储的情况</li>
                <li><strong>拒绝权：</strong>您有权拒绝数据跨境传输，但拒绝后将无法正常使用我们的服务</li>
                <li><strong>继续使用视为同意：</strong>您继续使用本服务，视为您同意数据跨境传输安排</li>
              </ul>
              
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ 重要提示：</strong>如您不同意将您的个人信息传输至新加坡，请立即停止使用我们的服务，并联系客服（haimozhouqiu@outlook.com）申请注销账户。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🗑️</span> 数据保留与删除
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 声音数据</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>声音数据将保留至您主动删除或账户注销</li>
                <li>您可以随时联系客服要求删除声音数据</li>
                <li>账户注销后，声音数据将在15个工作日内删除</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 账户信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>账户信息在账户存续期间持续保存</li>
                <li>账户注销后30天内删除</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 订单数据</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>根据《电子商务法》要求，订单数据保存不少于3年</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✏️</span> 您的权利
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>根据相关法律法规，您享有以下权利：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>知情权：</strong>了解我们如何收集、使用您的个人信息</li>
                <li><strong>决定权：</strong>限制或拒绝我们处理您的个人信息</li>
                <li><strong>查阅权：</strong>查阅我们持有的您的个人信息</li>
                <li><strong>更正权：</strong>要求更正不准确的个人信息</li>
                <li><strong>删除权：</strong>要求删除您的个人信息（声音数据）</li>
                <li><strong>投诉权：</strong>向有关主管部门投诉或举报</li>
              </ul>
              <p>如需行使上述权利，请联系：<a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              如您对本隐私政策有任何疑问、意见或建议，请通过以下方式联系我们：
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>邮箱：</strong> <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a>
              </p>
              <p className="text-gray-600">
                <strong>微信：</strong> txd027
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              我们将在收到您的反馈后15个工作日内予以回复。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
