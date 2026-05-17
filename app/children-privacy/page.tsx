import { Metadata } from "next";

export const metadata: Metadata = {
  title: "儿童隐私政策",
  description: "是我呀儿童个人信息保护专门政策，监护人必读",
};

export default function ChildrenPrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">儿童隐私政策</h1>
          <p className="text-gray-500">最后更新日期：2026年5月16日</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 政策说明
            </h2>
            <p className="text-gray-600 leading-relaxed">
              "是我呀"（以下简称"我们"）高度重视儿童个人信息保护。根据《中华人民共和国个人信息保护法》第三十一条以及《儿童个人信息网络保护规定》（2019年10月1日施行）的相关要求，我们专门制定本儿童隐私政策。本政策专门针对14周岁以下儿童（以下简称"儿童"）的个人信息处理活动，为监护人提供清晰、透明的说明。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              <strong>重要提示：</strong>如果您是14周岁以下儿童的监护人，请在您的孩子使用本服务前，仔细阅读并充分理解本政策的所有内容。如有任何疑问，请通过本政策末尾的联系方式与我们联系。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👨‍👩‍👧</span> 监护人的权利与义务
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 监护人明示同意</h3>
              <p>
                根据《儿童个人信息网络保护规定》第九条的要求，我们承诺：未经监护人的明示同意，我们不会收集、使用、披露儿童的个人信息。在您的孩子首次使用本服务前，我们会要求您（作为监护人）确认同意本政策，并点击确认后方可开始使用相关服务。
              </p>
              
              <h3 className="font-semibold text-gray-800">2. 监护人的控制权</h3>
              <p>作为监护人，您享有以下权利：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>查阅、复制我们收集的您孩子的个人信息</li>
                <li>更正您孩子个人信息中的不准确之处</li>
                <li>删除我们收集的您孩子的个人信息</li>
                <li>撤回您之前给予的同意</li>
                <li>要求我们对处理儿童个人信息的行为进行解释说明</li>
              </ul>
              
              <h3 className="font-semibold text-gray-800">3. 监护人的责任</h3>
              <p>作为监护人，您应当：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>引导您的孩子在使用互联网服务时保护个人信息</li>
                <li>告知您的孩子未经您的允许，不得向任何网站或服务提供个人信息</li>
                <li>确保您上传的照片中涉及儿童的，已获得该儿童父母的明确授权</li>
                <li>对您的孩子使用本服务进行适当的监督和指导</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📝</span> 我们收集的儿童个人信息
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 照片信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>收集目的：</strong>用于生成儿童个性化绘本故事</li>
                <li><strong>收集方式：</strong>您在创建绘本时主动上传</li>
                <li><strong>信息内容：</strong>包含儿童面部特征的数码照片</li>
                <li><strong>处理方式：</strong>照片将经过AI处理用于生成绘本插图</li>
              </ul>

              <h3 className="font-semibold text-gray-800">2. 基础信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>年龄信息：</strong>用于确认用户年龄并适用相应的保护措施</li>
                <li><strong>性别信息（可选）：</strong>用于生成更准确的绘本内容</li>
                <li><strong>名字/昵称（可选）：</strong>用于故事中的角色命名</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 使用行为信息</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>绘本风格选择偏好</li>
                <li>故事主题选择</li>
                <li>使用频率和使用时长</li>
              </ul>

              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-4">
                <strong>⚠️ 我们不会收集的信息：</strong>我们不会收集儿童的精确地理位置、通讯录信息、短信内容等敏感个人信息。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔒</span> 信息存储与安全
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 存储地点</h3>
              <p>
                我们使用Supabase作为数据存储服务提供商。Supabase的数据中心位于新加坡（亚太地区）。我们会确保数据存储符合中华人民共和国相关法律法规对个人信息出境的要求。
              </p>
              <p className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-4">
                <strong>⚠️ 数据跨境传输说明：</strong>您孩子的个人信息（包括照片）将通过互联网传输至新加坡存储。我们已按照《个人信息保护法》相关规定与Supabase签署数据处理协议（DPA），Supabase已通过SOC 2 Type II、ISO 27001等国际安全认证。如您不同意数据跨境传输，请勿让孩子使用本服务。
              </p>

              <h3 className="font-semibold text-gray-800">2. 存储期限</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>照片数据：</strong>我们建议您在生成绘本后及时下载保存。您可随时登录账户手动删除照片，也可联系客服（haimozhouqiu@outlook.com）协助删除。我们将在您提出删除请求后15个工作日内完成删除。</li>
                <li><strong>账户信息：</strong>账户存续期间持续保存，账户注销后30天内删除</li>
                <li><strong>使用记录：</strong>最近180天内的使用记录将被保留用于服务优化</li>
                <li><strong>订单数据：</strong>根据《电子商务法》要求，保存不少于3年</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 到期处理方式</h3>
              <p>当存储期限届满时，我们将按照以下方式处理儿童个人信息：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>手动删除：监护人可随时联系我们要求删除儿童个人信息</li>
                <li>匿名化处理：对于无法删除但不再需要识别的信息，我们将进行匿名化处理</li>
                <li>提前删除：监护人可随时联系我们要求提前删除儿童个人信息</li>
              </ul>

              <h3 className="font-semibold text-gray-800">4. 安全保障措施</h3>
              <p>我们采取以下技术和管理措施保护儿童个人信息安全：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>加密传输：</strong>所有数据使用HTTPS/TLS加密传输，防止数据在传输过程中被窃取</li>
                <li><strong>加密存储：</strong>照片和敏感个人信息采用AES-256加密存储</li>
                <li><strong>访问控制：</strong>实行严格的权限管理，只有经授权的人员在必要时才能访问儿童个人信息</li>
                <li><strong>安全审计：</strong>定期进行安全漏洞扫描和渗透测试</li>
                <li><strong>员工培训：</strong>对处理儿童个人信息的工作人员进行专门的隐私保护培训</li>
                <li><strong>最小化原则：</strong>只收集提供服务所必需的最少信息</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🚫</span> 拒绝提供信息的后果
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                您有权拒绝提供儿童的某些个人信息。请注意，拒绝提供某些信息可能导致以下后果：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>拒绝提供照片：</strong>将无法使用AI绘本生成服务，因为照片是生成个性化绘本的必要素材</li>
                <li><strong>拒绝提供年龄信息：</strong>我们无法准确判断用户是否属于儿童，将按照一般隐私政策处理相关信息</li>
                <li><strong>拒绝同意本政策：</strong>您的孩子将无法使用本服务</li>
              </ul>
              <p className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <strong>💡 提示：</strong>您可以随时撤回同意，但撤回前我们基于同意进行的处理行为不受影响。如需撤回同意，请联系我们。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>✏️</span> 更正与删除
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 更正个人信息的途径和流程</h3>
              <p>监护人可以通过以下方式要求更正儿童个人信息：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>在线修改：</strong>登录账户后，在"个人设置"中修改相关信息</li>
                <li><strong>联系客服：</strong>发送邮件至 haimozhouqiu@outlook.com，说明需要更正的内容</li>
                <li><strong>微信联系：</strong>添加微信号 txd027，发送更正请求</li>
              </ul>
              <p>我们将在15个工作日内完成核查并处理您的更正请求。</p>

              <h3 className="font-semibold text-gray-800">2. 删除个人信息的途径和流程</h3>
              <p>监护人可以通过以下方式要求删除儿童个人信息：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>自助删除：</strong>登录账户后，在"照片管理"中删除已上传的照片</li>
                <li><strong>注销账户：</strong>通过账户设置中的"注销账户"功能，删除所有相关信息</li>
                <li><strong>联系客服：</strong>发送邮件至 haimozhouqiu@outlook.com，主题注明"儿童信息删除申请"</li>
              </ul>
              <p>我们将在15个工作日内完成核查并处理您的删除请求。删除后，相关数据将无法恢复。</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>👤</span> 个人信息保护负责人
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>我们指定专人负责儿童个人信息保护工作：</p>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-600">
                  <strong>个人信息保护负责人：</strong>周女士
                </p>
                <p className="text-gray-600">
                  <strong>邮箱：</strong> haimozhouqiu@outlook.com
                </p>
                <p className="text-gray-600">
                  <strong>微信号：</strong> txd027
                </p>
                <p className="text-gray-600">
                  <strong>工作时间：</strong>周一至周五 9:00-18:00（法定节假日除外）
                </p>
              </div>
              <p>
                如您对本政策有任何疑问，或希望就儿童个人信息保护问题与我们联系，请通过上述方式联系我们。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🚨</span> 安全事件通知机制
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <h3 className="font-semibold text-gray-800">1. 发现与评估</h3>
              <p>
                我们建立了完善的安全事件监测机制。一旦发现儿童个人信息泄露、损毁或丢失的安全事件，我们将立即启动应急预案，进行事件评估，确定事件的影响范围和严重程度。
              </p>

              <h3 className="font-semibold text-gray-800">2. 通知机制</h3>
              <p>根据《儿童个人信息网络保护规定》第二十三条的要求：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>我们将在安全事件发生后<strong>72小时内</strong>向有关主管部门报告</li>
                <li>我们将在安全事件发生后<strong>72小时内</strong>通过邮件、短信等合理方式通知监护人</li>
                <li>通知内容将包括：安全事件的基本情况和可能的影响、我们已采取或将要采取的处置措施、监护人可采取的防范建议、我们的联系方式等</li>
              </ul>

              <h3 className="font-semibold text-gray-800">3. 补救措施</h3>
              <p>我们将采取以下措施减少安全事件对儿童的影响：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>立即阻断未授权访问，防止数据进一步泄露</li>
                <li>评估并实施数据恢复措施</li>
                <li>加强安全防护措施，防止类似事件再次发生</li>
                <li>如有必要，配合有关主管部门进行调查</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📖</span> 政策适用说明
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                本儿童隐私政策是《是我呀隐私政策》的组成部分，与《是我呀隐私政策》具有同等法律效力。如本政策与《是我呀隐私政策》存在冲突，以本政策为准。
              </p>
              <p>
                本政策适用于14周岁以下的儿童用户。对于14周岁及以上的用户，我们将适用《是我呀隐私政策》的相关规定。
              </p>
              <p>
                <strong>法律依据：</strong>本政策依据《中华人民共和国个人信息保护法》《中华人民共和国未成年人保护法》《儿童个人信息网络保护规定》等法律法规制定。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔄</span> 政策更新
            </h2>
            <p className="text-gray-600 leading-relaxed">
              我们可能会根据法律法规的变化、服务功能的调整或实际运营需要，不时更新本儿童隐私政策。重大变更（例如涉及收集目的、方式、范围的变化，或监护人权利的变化）我们将通过网站公告、弹窗通知或邮件等方式提前通知监护人。
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              请监护人定期查阅本政策，以确保了解最新的儿童个人信息保护措施。继续让孩子使用服务即表示您接受更新后的政策。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📮</span> 联系我们
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              如您对本儿童隐私政策有任何疑问、意见或建议，请通过以下方式联系我们：
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
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
        </div>
      </div>
    </div>
  );
}
