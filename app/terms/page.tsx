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
          <p className="text-gray-500">最后更新日期：2026年5月17日</p>
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
                <li>AI绘本生成服务 — 根据孩子的兴趣特征生成专属绘本</li>
                <li>AI故事生成服务 — 根据主题和孩子信息生成定制睡前故事</li>
                <li>AI配图生成服务 — 为故事生成配套插图</li>
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
              <span>🎤</span> 声音录制与使用
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>您录制声音即表示：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>您确认录制的声音属于您本人</li>
                <li>同意我们使用您的声音生成您的个人睡前故事</li>
                <li>同意声音数据的加密存储处理</li>
                <li>理解声音仅用于本次故事生成，不会用于训练AI模型</li>
              </ul>
              <p className="bg-green-50 p-4 rounded-xl border border-green-200">
                <strong>💡 说明：</strong>您可以随时联系客服删除您的声音数据。删除后，我们将无法使用该声音继续生成故事。
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
                您使用AI生成的故事内容（故事文本和配图）的<strong>版权归您个人所有</strong>，您有权自由使用、分享和打印。
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
                AI生成的内容均标注"AI生成"标识，<strong>仅供参考娱乐使用，不代表任何真实事件或观点，不构成教育建议</strong>。AI生成内容可能存在不准确之处，"是我呀"不对AI生成内容的准确性、完整性或适用性作出任何保证。
              </p>

              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <strong>⚠️ 免责声明：</strong>AI生成的故事内容仅供参考娱乐使用，不构成专业建议（医疗、教育、心理等）。如需专业帮助，请咨询相关领域的专业人士。
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
                "是我呀"服务使用的AI生成模型由<strong>火山引擎（字节跳动旗下）</strong>提供。我们与火山引擎合作，使用其先进的语音合成和图像生成技术为您提供服务。
              </p>

              <h3 className="font-semibold text-gray-800">2. 生成内容说明</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI生成内容可能存在不准确性、偏差或虚构成分</li>
                <li>AI生成内容不构成专业建议（医疗、法律、财务、教育等）</li>
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
                <li>使用服务训练或改进AI模型</li>
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
                用户使用本服务生成的睡前故事内容（包括故事文本和插图）的<strong>版权归用户所有</strong>。用户有权对生成的内容进行自由使用、分享、打印、商业使用等。
              </p>
              <p className="mt-2">
                <strong>用户授权：</strong>用户同意授予我们非独占的展示和存储许可，以便我们能够正常提供服务和备份数据。此授权不影响用户对生成内容的所有权。
              </p>

              <h3 className="font-semibold text-gray-800">2. 平台内容与权利</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>网站界面设计、排版、图标等受著作权法保护</li>
                <li>"是我呀"商标、品牌名称受法律保护</li>
                <li>用户不得复制、修改或商业使用平台内容</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💳</span> 付费服务与退款
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 订阅说明</h3>
              <p>
                我们提供月卡和年卡等订阅服务。订阅费用将根据您选择的套餐自动续费。
              </p>

              <h3 className="font-semibold text-gray-800">2. 自动续费</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>订阅将在当前周期结束前24小时内自动续费</li>
                <li>续费前我们会发送提醒通知</li>
                <li>如需取消订阅，请在当前周期结束前取消</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 退款政策</h3>
              <p>
                由于AI内容生成为数字化商品，一经生成完成不支持退款。具体退款政策请查看我们的《退款政策》页面。
              </p>

              <h3 className="font-semibold text-gray-800">4. 价格调整</h3>
              <p>
                我们保留调整服务价格的权利。价格调整前，我们将提前通知用户。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> 免责声明与责任限制
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p className="bg-red-50 p-4 rounded-xl border border-red-200">
                <strong>重要：</strong>在适用法律允许的最大范围内，"是我呀"不对以下情况承担责任：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>因用户自身原因造成的服务中断或数据丢失</li>
                <li>因第三方原因（包括但不限于网络故障、服务器故障）造成的损失</li>
                <li>用户使用AI生成内容产生的任何后果</li>
                <li>AI生成内容的不准确性或不完整性</li>
                <li>用户账户被盗用造成的损失（如用户未能妥善保管密码）</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔧</span> 服务变更与终止
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 服务变更</h3>
              <p>
                我们有权随时修改、暂停或终止服务的任何方面，恕不另行通知。
              </p>

              <h3 className="font-semibold text-gray-800">2. 账户终止</h3>
              <p>
                如用户违反本协议，我们有权暂停或终止用户的账户。
              </p>

              <h3 className="font-semibold text-gray-800">3. 数据保留</h3>
              <p>
                账户终止后，我们有权根据法律法规保留必要的数据。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📜</span> 协议修改
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                我们有权随时修改本协议。修改后的协议将在网站上公布。如您继续使用服务，视为您接受修改后的协议。
              </p>
              <p>
                重大变更（如涉及服务费用、用户权利等）我们将提前通知用户。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏛️</span> 适用法律与争议解决
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                本协议的订立、执行和解释均适用中华人民共和国法律。
              </p>
              <p>
                如双方发生争议，应首先通过友好协商解决；协商不成的，任何一方均可向被告住所地人民法院提起诉讼。
              </p>
            </div>
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
                <strong>邮箱：</strong> <a href="mailto:haimozhouqiu@outlook.com" className="text-primary-orange hover:underline">haimozhouqiu@outlook.com</a>
              </p>
              <p className="text-gray-600">
                <strong>微信：</strong> txd027
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
