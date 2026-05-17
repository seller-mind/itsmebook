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
          <p className="text-gray-500">最后更新日期：2026年5月16日</p>
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
              <strong>特别提示：</strong>如果您是14周岁以下儿童的监护人，请同时阅读我们的《儿童隐私政策》以了解我们如何专门保护儿童个人信息。
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
                <li>Cookie信息：访问偏好、登录状态等</li>
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
              <li>保障服务安全和防范欺诈</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🛡️</span> 信息保护
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
                      <td className="border border-gray-200 p-3">用户账户数据、照片、生成内容</td>
                      <td className="border border-gray-200 p-3"><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-orange hover:underline">查看</a></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="border border-gray-200 p-3 bg-yellow-50 text-sm">
                        <strong>⚠️ 数据跨境传输说明：</strong>Supabase数据中心位于新加坡，您的个人信息和上传的照片将通过互联网传输至新加坡存储。我们已按照《中华人民共和国个人信息保护法》第三十八条的规定，与Supabase签署数据处理协议（DPA），确保数据处理符合相关安全标准。Supabase已通过SOC 2 Type II、ISO 27001等国际安全认证。您继续使用本服务即表示同意数据跨境传输。如您不同意，可在账户设置中注销账户以停止数据处理。
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3 font-medium">火山引擎（豆包）</td>
                      <td className="border border-gray-200 p-3">AI内容生成</td>
                      <td className="border border-gray-200 p-3">用户描述、照片参考</td>
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
              <p>我们的数据存储服务商Supabase的数据中心位于新加坡（亚太地区）。当您使用我们的服务时，您的个人信息（包括账户信息和上传的照片）将通过互联网传输至新加坡的服务器进行存储和处理。</p>
              
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
              <span>⏱️</span> 数据保留期限
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们将在以下期限内保留您的个人信息：</p>
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">数据类型</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">保留期限</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">到期处理方式</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">账户数据</td>
                      <td className="border border-gray-200 p-3">账户存续期间 + 注销后30天</td>
                      <td className="border border-gray-200 p-3">安全删除</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">上传照片</td>
                      <td className="border border-gray-200 p-3">您主动删除前持续保留</td>
                      <td className="border border-gray-200 p-3">手动删除（可联系客服协助）</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">生成的绘本</td>
                      <td className="border border-gray-200 p-3">您主动删除前持续保留</td>
                      <td className="border border-gray-200 p-3">手动删除（请及时下载保存）</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">订单数据</td>
                      <td className="border border-gray-200 p-3">不少于5年</td>
                      <td className="border border-gray-200 p-3">根据《电子商务法》要求保留</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">访问日志</td>
                      <td className="border border-gray-200 p-3">180天</td>
                      <td className="border border-gray-200 p-3">自动清理</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">Cookie数据</td>
                      <td className="border border-gray-200 p-3">根据具体Cookie类型（见Cookie政策）</td>
                      <td className="border border-gray-200 p-3">浏览器自动清理或手动清除</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🍪</span> Cookie使用
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                我们使用Cookie和类似技术来改善用户体验，包括记住您的偏好设置、分析网站流量等。详情请阅读我们的《Cookie政策》。
              </p>
              <p className="mt-2">
                <a href="/cookie" className="text-primary-orange hover:underline font-medium">查看完整Cookie政策 →</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👶</span> 儿童隐私
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                我们特别重视儿童的隐私保护。根据《儿童个人信息网络保护规定》的要求，我们制定了专门的《儿童隐私政策》来保护14周岁以下儿童的个人信息。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-blue-800">
                  <strong>重要提示：</strong>如果您是14周岁以下儿童的监护人，请务必阅读我们的《儿童隐私政策》，了解我们如何专门保护您孩子的个人信息。
                </p>
              </div>
              <p className="mt-4">
                <a href="/children-privacy" className="text-primary-orange hover:underline font-medium">查看儿童隐私政策 →</a>
              </p>
              <h3 className="font-semibold text-gray-800 mt-4">作为家长或监护人：</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>您需确认同意后，孩子才能使用我们的服务</li>
                <li>我们不会故意收集13岁以下儿童的个人信息（除非有监护人同意）</li>
                <li>您上传的照片仅用于生成您的个人绘本</li>
                <li>您可以随时删除孩子的照片和相关内容</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 数据安全事件应急预案
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们建立了完善的数据安全事件应急响应机制：</p>
              
              <h3 className="font-semibold text-gray-800">1. 发现与评估</h3>
              <p>我们通过安全监控系统持续监测数据安全风险。一旦发现事件，将立即进行影响评估。</p>
              
              <h3 className="font-semibold text-gray-800">2. 通知机制</h3>
              <p>根据《中华人民共和国个人信息保护法》第五十七条的要求：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>我们将在安全事件发生后<strong>72小时内</strong>向有关主管部门报告</li>
                <li>我们将在安全事件发生后<strong>72小时内</strong>通知受影响的用户</li>
                <li>通知内容将包括：事件基本情况、可能影响、已采取的补救措施、建议的防范措施等</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800">3. 补救措施</h3>
              <p>我们将立即采取以下措施：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>阻断未授权访问，防止数据进一步泄露</li>
                <li>评估并实施数据恢复措施</li>
                <li>加强安全防护措施</li>
                <li>配合主管部门进行调查</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✏️</span> 数据删除
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 自助删除</h3>
              <p>您可以通过以下方式自行删除您的数据：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>登录账户后，在"照片管理"中删除已上传的照片</li>
                <li>通过"账户设置"中的"注销账户"功能删除所有账户数据</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800">2. 联系我们删除</h3>
              <p>您也可以联系我们协助删除数据：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>发送邮件至：haimozhouqiu@outlook.com</li>
                <li>添加微信：txd027</li>
                <li>邮件主题请注明"个人信息删除申请"</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800">3. 响应时间</h3>
              <p>我们承诺在<strong>15个工作日内</strong>完成数据删除请求的核查和处理。删除后，相关数据将无法恢复。</p>
              
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-4">
                <strong>⚠️ 注意：</strong>根据法律法规要求，部分数据（如订单记录）需要在一定期限内保留。如需删除此类数据，请提供合理说明，我们将根据具体情况处理。
              </p>
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
              <li><strong>知情权：</strong>了解我们如何收集、使用您的个人信息</li>
              <li><strong>访问权：</strong>查阅我们持有的您的个人信息</li>
              <li><strong>更正权：</strong>更正不准确或不完整的个人信息</li>
              <li><strong>删除权：</strong>要求删除您的个人信息</li>
              <li><strong>撤回同意：</strong>撤回您之前给予的同意（不影响撤回前已进行的处理）</li>
              <li><strong>数据可携带权：</strong>获取您的个人数据的副本</li>
              <li><strong>投诉权：</strong>向有关主管部门投诉</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              如需行使上述任何权利，请通过本政策末尾的联系方式联系我们。我们将在15个工作日内响应您的请求。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔗</span> 第三方服务
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们的服务可能包含指向第三方网站的链接。我们不对第三方网站的隐私实践负责。建议您查看这些第三方的隐私政策。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              我们的服务使用多个第三方服务商（如上表所示）。我们确保这些服务商采取适当的安全措施来保护您的个人信息。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
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
            <p className="text-gray-600 leading-relaxed mt-4">
              我们将在收到您的反馈后15个工作日内予以回复。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔄</span> 政策更新
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能会不时更新本隐私政策。重大变更将在网站上公布并更新"最后更新日期"。建议您定期查阅本政策。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              如本政策发生重大变更（如涉及收集目的、方式、范围的变化，或您的权利的变化），我们将通过网站公告、弹窗通知或邮件等方式提前通知您。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
