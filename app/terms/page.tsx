import { Metadata } from "next";

export const metadata: Metadata = {
  title: "用户协议",
  description: "是我呀用户服务协议，使用条款和条件",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">用户协议</h1>
          <p className="text-gray-500">最后更新日期：2026年5月16日</p>
        </div>

        {/* Content */}
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
              <span>📝</span> 电子合同条款
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong>本协议为电子合同。</strong>您点击"同意"或"注册"按钮，或以任何方式使用我们的服务，即表示您已充分阅读、理解并同意接受本协议的约束，本协议即产生法律效力。
              </p>
              <p>
                本电子合同与书面合同具有同等法律效力。您同意并确认，电子记录与书面签名一样具有法律约束力。
              </p>
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>💡 提示：</strong>您可以在"账户设置"中查看本协议的历史版本。如您对协议内容有任何疑问，请在同意前联系我们。
              </p>
            </div>
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
              <p>
                我们保留随时调整、修改或中断服务功能的权利，并会提前通知用户。
              </p>
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
              <p>
                您应当对账户安全负责。如发现任何未经授权使用您账户的情况，应立即通知我们。
              </p>
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
              <p>
                您使用AI生成的内容版权归您个人所有，您有权自由使用、分享和打印。
              </p>

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
              <p>
                AI生成的内容均标注"AI生成"标识，仅供娱乐参考，不代表任何真实事件或观点。AI生成内容可能存在不准确之处，"是我呀"不对AI生成内容的准确性、完整性或适用性作出任何保证。
              </p>

              <h3 className="font-semibold text-gray-800">4. 侵权责任</h3>
              <p className="bg-red-50 p-4 rounded-xl border border-red-200">
                <strong>⚠️ 重要：</strong>用户须确保上传的照片拥有合法使用权，且照片中人物（尤其是未成年人）的肖像权已获得其监护人的明确授权。因用户上传内容导致的任何侵权纠纷（包括但不限于肖像权、著作权、隐私权等），由用户自行承担全部法律责任和经济赔偿，"是我呀"不承担任何连带责任。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span> AI服务特别声明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>法律依据：</strong>本条款依据《生成式人工智能服务管理暂行办法》（2023年8月15日施行）制定。
              </p>
              
              <h3 className="font-semibold text-gray-800">1. AI模型说明</h3>
              <p>
                "是我呀"服务使用的AI生成模型由<strong>火山引擎（字节跳动旗下）</strong>提供。我们与火山引擎合作，使用其先进的图像生成技术为您提供绘本生成服务。
              </p>

              <h3 className="font-semibold text-gray-800">2. 生成内容说明</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI生成内容可能存在不准确性、偏差或虚构成分</li>
                <li>AI生成内容不构成专业建议（医疗、法律、财务等）</li>
                <li>AI生成内容仅供参考娱乐使用，不应作为事实依据</li>
                <li>我们不对AI生成内容的准确性、完整性、可靠性作出任何明示或暗示的保证</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 用户义务</h3>
              <p>您不得利用本服务：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>生成违反法律法规的内容</li>
                <li>生成侵害他人合法权益的内容</li>
                <li>生成虚假信息或谣言</li>
                <li>生成危害国家安全、社会公共利益的内容</li>
                <li>训练或改进AI模型</li>
              </ul>

              <h3 className="font-semibold text-gray-800">4. 内容审核与处置</h3>
              <p>
                我们有权对AI生成内容进行审核。如发现违法内容或疑似违法内容，我们有权：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>暂停或终止向您提供服务</li>
                <li>保存相关记录并向有关主管部门报告</li>
                <li>采取必要的技术措施防止违法内容传播</li>
              </ul>

              <h3 className="font-semibold text-gray-800">5. 安全评估</h3>
              <p>
                我们承诺按照《生成式人工智能服务管理暂行办法》的要求，对生成内容进行必要的安全评估，并建立健全的投诉举报机制。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💎</span> 知识产权归属
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 用户生成内容</h3>
              <p>
                用户使用本服务生成的绘本内容（包括故事文本和插图）的<strong>版权归用户所有</strong>。用户有权对生成的内容进行自由使用、分享、打印、商业使用等。
              </p>
              <p className="mt-2">
                <strong>用户授权：</strong>用户同意授予我们非独占的展示和存储许可，以便我们能够正常提供服务和备份数据。此授权不影响用户对生成内容的所有权。
              </p>

              <h3 className="font-semibold text-gray-800">2. 平台内容与权利</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>网站界面设计、排版、图标等受著作权法保护</li>
                <li>"是我呀"商标、品牌名称受法律保护</li>
                <li>AI模型、技术算法属于我们的核心资产</li>
                <li>未经授权，不得复制、修改、传播我们的知识产权</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 反馈内容</h3>
              <p>
                您向我们提供的建议、反馈、创意等（统称"反馈"），您同意我们有权自由使用这些反馈来改进我们的服务，且无需向您支付任何费用。
              </p>
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
                <li>支持支付宝、微信支付等支付方式</li>
                <li>付费成功后即时生效</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 退款政策</h3>
              <p>退款规则请参阅我们的《退款政策》。您可以通过以下链接查看详情：</p>
              <p><a href="/refund" className="text-primary-orange hover:underline">查看退款政策 →</a></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>付费会员开通7天内可申请全额退款（未使用服务的情况下）</li>
                <li>AI生成属于虚拟商品，已生成内容不支持退款</li>
                <li>特殊情况可联系客服协商</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 订阅服务说明</h3>
              <p>当前我们提供的所有套餐均为一次性购买，不涉及自动续费：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>体验版、标准版、精制版：一次性购买，当前有效</li>
                <li>月卡：一次性购买，有效期为一个自然月，到期后需手动续购</li>
              </ul>
              <p className="mt-4">如未来开通自动续费功能，我们将依据《网络交易监督管理办法》的要求，提前5日以显著方式通知您，并确保您可便捷取消订阅。</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📢</span>
                  <div>
                    <p className="font-semibold text-blue-800">到期提醒</p>
                    <p className="text-blue-700 text-sm">月卡用户到期前，我们会通过邮件或短信提醒您续购</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🚫</span> 禁止行为
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              使用我们的服务时，您不得：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>违反任何适用法律法规</li>
              <li>侵犯他人知识产权或隐私权</li>
              <li>尝试破解、入侵或破坏我们的系统</li>
              <li>使用自动化工具大规模生成内容</li>
              <li>转售、转授权我们的服务</li>
              <li>传播恶意软件或病毒</li>
              <li>冒充他人或机构</li>
              <li>利用AI生成的内容从事违法活动</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚖️</span> 赔偿条款
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                您同意，因您违反本协议或因您上传的内容导致"是我呀"遭受任何第三方索赔、诉讼、损失、损害、费用（包括合理的律师费），您应当对"是我呀"进行全额赔偿并使其免受损害。具体包括但不限于：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>因您上传的照片侵犯他人肖像权、隐私权导致的索赔</li>
                <li>因您上传的照片或描述侵犯他人著作权、商标权等知识产权导致的索赔</li>
                <li>因您利用AI生成不当内容导致的索赔</li>
                <li>因您违反法律法规使用本服务导致的行政处罚或诉讼</li>
              </ul>
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ 特别提醒：</strong>请勿上传他人的照片，尤其是未经监护人同意的未成年人照片。如因此产生法律纠纷，您需自行承担全部责任。
              </p>
            </div>
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
              <p>
                在法律允许的最大范围内，我们不对任何间接、附带、特殊或后果性损害承担责任。
              </p>
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
            <p className="text-gray-600 leading-relaxed mb-4">
              如您对本协议有任何疑问，请联系我们：
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

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚖️</span> 适用法律
            </h2>
            <p className="text-gray-600 leading-relaxed">
              本协议的解释和执行均适用中华人民共和国法律。如发生争议，双方应友好协商解决；协商不成的，任一方可向被告所在地有管辖权的人民法院提起诉讼。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
