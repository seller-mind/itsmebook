import { Metadata } from "next";

export const metadata: Metadata = {
  title: "退款政策",
  description: "睡前魔法书退款政策，了解退款条件和流程",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">退款政策</h1>
          <p className="text-gray-500">最后更新日期：2026年5月16日</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 政策说明
            </h2>
            <p className="text-gray-600 leading-relaxed">
              "睡前魔法书"（以下简称"我们"）承诺为用户提供优质的服务体验。本退款政策依据《中华人民共和国消费者权益保护法》第二十五条以及《网络交易监督管理办法》（2021年5月1日施行）的相关规定制定，旨在保障您的合法权益。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>特别说明：</strong>由于AI绘本生成属于数字化商品/服务（虚拟商品），根据相关法律法规，部分情形下可能不适用无理由退货。请您仔细阅读以下退款政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💰</span> 退款适用情形
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">✅ 支持退款的情形</h3>
              <div className="grid gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">情形一：支付成功但未开始生成</p>
                  <p>如果您已完成支付，但AI绘本尚未开始生成，您可以申请全额退款。</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">情形二：生成过程中系统故障</p>
                  <p>如果因我们的系统故障、技术问题导致生成失败或无法完成，您可以申请全额退款。</p>
                  <p className="text-sm mt-2 text-green-700">注：需提供相关截图或证明材料</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 mb-2">情形三：重复扣款</p>
                  <p>如果您因系统原因或操作失误导致同一订单被重复扣款，我们将退还重复扣除的金额。</p>
                  <p className="text-sm mt-2 text-green-700">注：需提供支付记录截图</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="font-semibold text-blue-800 mb-2">情形四：特殊情况协商退款</p>
                  <p>对于以下情况，您可以联系我们协商处理退款事宜：</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-blue-700">
                    <li>因不可抗力（如突发疾病、紧急情况）无法使用服务</li>
                    <li>对生成结果严重不满意（需提供具体说明）</li>
                    <li>其他经我们评估认为合理的特殊原因</li>
                  </ul>
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mt-6">❌ 不支持退款的情形</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-semibold text-red-800 mb-2">AI生成内容属于虚拟商品，存在以下特殊规定：</p>
                <ul className="list-disc list-inside space-y-2 text-red-700">
                  <li>根据《消费者权益保护法》第二十五条，数字化商品不适用七日无理由退货</li>
                  <li><strong>已生成完成</strong>的绘本不支持退款（虚拟商品一经使用即完成交付）</li>
                  <li>用户自身原因导致的退款诉求（如误操作、改变主意等）</li>
                  <li>违反用户协议导致账户被封禁的情况</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📊</span> 具体退款场景分类
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-3 text-left font-semibold">场景</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">退款金额</th>
                      <th className="border border-gray-200 p-3 text-left font-semibold">说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3">支付成功，生成未开始</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">全额退款</td>
                      <td className="border border-gray-200 p-3">立即处理</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">生成过程中系统故障</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">全额退款</td>
                      <td className="border border-gray-200 p-3">需提供截图证明</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">生成失败（系统原因）</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">全额退款</td>
                      <td className="border border-gray-200 p-3">自动退款或人工处理</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">已生成完成</td>
                      <td className="border border-gray-200 p-3 text-red-600 font-semibold">不支持</td>
                      <td className="border border-gray-200 p-3">可协商但不保证</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3">重复扣款</td>
                      <td className="border border-gray-200 p-3 text-green-600 font-semibold">全额退款</td>
                      <td className="border border-gray-200 p-3">需提供支付记录</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-200 p-3">误操作/改变主意</td>
                      <td className="border border-gray-200 p-3 text-red-600 font-semibold">不支持</td>
                      <td className="border border-gray-200 p-3">虚拟商品一经使用不支持</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> 退款申请流程
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>如您需要申请退款，请按以下流程操作：</p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">准备退款申请材料</p>
                    <p className="text-sm">包括：订单编号、支付凭证、问题说明（如有）</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">联系客服</p>
                    <p className="text-sm">发送邮件至：<a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a></p>
                    <p className="text-sm">或添加微信：txd027</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">等待审核</p>
                    <p className="text-sm">我们将在1-5个工作日内完成审核</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <p className="font-semibold text-gray-900">退款到账</p>
                    <p className="text-sm">审核通过后，退款将在3-7个工作日内原路退回</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="font-semibold text-blue-800 mb-2">📧 退款申请邮件模板</p>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-600 font-mono">
                  <p><strong>主题：</strong>退款申请 - 订单号[请填写]</p>
                  <p className="mt-2"><strong>正文：</strong></p>
                  <p>您好，</p>
                  <p className="mt-1">订单编号：[请填写]</p>
                  <p>退款原因：[请填写]</p>
                  <p>支付金额：[请填写]</p>
                  <p>支付方式：[请填写]</p>
                  <p className="mt-1">附件：支付截图</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⏱️</span> 退款处理时限
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">审核时限</p>
                  <p className="text-2xl font-bold text-primary-orange">1-5个工作日</p>
                  <p className="text-sm text-gray-500 mt-1">我们将在收到您的退款申请后尽快完成审核</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-2">退款到账</p>
                  <p className="text-2xl font-bold text-primary-orange">3-7个工作日</p>
                  <p className="text-sm text-gray-500 mt-1">审核通过后，退款将原路退回至您的支付账户</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                <strong>注：</strong>退款到账时间可能因支付渠道、银行处理时间等因素有所不同。如超过7个工作日未收到退款，请联系我们查询。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> 退款方式
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们采用<strong>原路退回</strong>的退款方式：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>支付宝支付：</strong>退款将退回至您的支付宝账户</li>
                <li><strong>微信支付：</strong>退款将退回至您的微信钱包</li>
                <li><strong>其他支付方式：</strong>根据实际支付渠道确定退回方式</li>
              </ul>
              <p className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <strong>⚠️ 注意：</strong>退款只能退回至您原支付的账户，不支持更换退款账户。如有特殊情况，请联系客服说明。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📅</span> 月卡/订阅退款规则
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>针对月卡、季卡、年卡等订阅类服务，我们制定以下退款规则：</p>
              
              <h3 className="font-semibold text-gray-800">1. 未使用订阅服务</h3>
              <p>如果您购买订阅后尚未使用任何服务，可申请全额退款。</p>

              <h3 className="font-semibold text-gray-800">2. 已使用部分服务</h3>
              <p>退款金额将按照以下公式计算：</p>
              <div className="bg-gray-50 rounded-xl p-4 my-4">
                <p className="font-mono text-center">
                  <strong>退款金额 = 实际支付金额 - (已使用天数 × 日均费用)</strong>
                </p>
                <p className="text-sm text-gray-500 text-center mt-2">
                  日均费用 = 实际支付金额 ÷ 订阅总天数
                </p>
              </div>

              <h3 className="font-semibold text-gray-800">3. 自动续费订阅</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>如需取消自动续费，请在当前订阅周期结束前24小时操作</li>
                <li>如在扣费后申请退款，已享有的服务期限不予退还</li>
                <li>取消自动续费后，您可以继续使用当前订阅周期内的服务</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="font-semibold text-blue-800 mb-2">💡 如何取消自动续费</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>登录您的账户</li>
                  <li>进入"账户设置"或"订阅管理"</li>
                  <li>找到"自动续费"选项并关闭</li>
                  <li>或在订阅到期前24小时内联系我们取消</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>❓</span> 常见问题
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <div className="space-y-3">
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: 生成失败可以退款吗？</summary>
                  <p className="mt-2 text-gray-600">A: 如果是因为我们的系统故障或技术问题导致生成失败，您可以申请全额退款。请提供相关截图或错误信息以便我们核实处理。</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: 对生成结果不满意可以退款吗？</summary>
                  <p className="mt-2 text-gray-600">A: AI生成内容存在一定的主观性和不确定性。由于生成结果不符合您的预期（而非质量问题）通常不在退款范围内。但如果您认为存在严重问题，请联系我们协商处理。</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: 退款需要多久到账？</summary>
                  <p className="mt-2 text-gray-600">A: 我们承诺在1-5个工作日内完成审核，审核通过后3-7个工作日内退款到账。具体到账时间取决于支付渠道和银行的处理速度。</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: 可以退款到其他账户吗？</summary>
                  <p className="mt-2 text-gray-600">A: 为了保障资金安全，退款只能原路退回至您原支付的账户。如有特殊情况，请联系客服说明。</p>
                </details>
                
                <details className="bg-gray-50 rounded-xl p-4 cursor-pointer">
                  <summary className="font-semibold text-gray-900">Q: 如何联系客服申请退款？</summary>
                  <p className="mt-2 text-gray-600">A: 您可以通过以下方式联系我们：<br/>📧 邮箱：haimozhouqiu@outlook.com<br/>💬 微信：txd027</p>
                </details>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              如您有任何关于退款的问题，请通过以下方式联系我们：
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                <strong>邮箱：</strong> <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a>
              </p>
              <p className="text-gray-600">
                <strong>微信号：</strong> txd027
              </p>
              <p className="text-gray-600">
                <strong>工作时间：</strong> 周一至周五 9:00-18:00（法定节假日除外）
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              我们将在收到您的反馈后尽快处理退款申请。如有任何争议，我们将依法保护您的合法权益。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
