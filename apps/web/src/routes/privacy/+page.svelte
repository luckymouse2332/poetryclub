<script lang="ts">
  import {
    DocumentPageHeader,
    DocumentSection,
    InfoTable,
    FeatureGrid,
    IntroSection,
    ProcessFlow,
    AlertBox,
  } from '$lib/components';
</script>

<svelte:head>
  <title>隐私政策 - 回中诗社</title>
  <meta name="description" content="回中诗社隐私政策 - 保护您的个人信息安全" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="card bg-base-200 shadow-xl p-8 rounded-xl">
    <DocumentPageHeader
      title="隐私政策"
      lastUpdated="2024年1月1日"
      effectiveDate="2024年1月1日"
    />

    <div class="prose prose-lg max-w-none text-base-content">
      <!-- 引言 -->
      <IntroSection title="引言">
        <p class="leading-relaxed text-lg">
          回中诗社（以下简称"我们"）深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
        </p>
        <p class="leading-relaxed mt-4">
          本隐私政策适用于您通过回中诗社网站、移动应用程序等方式访问和使用我们的产品与/或服务。
        </p>
      </IntroSection>

      <!-- 第一部分：我们收集的信息 -->
      <DocumentSection title="第一部分 我们收集的信息">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              1.1 您主动提供的信息
            </h3>
            <FeatureGrid
              columns="grid-cols-1 md:grid-cols-2"
              bgColor="bg-base-300"
              borderColor="border-base-300"
              features={[
                {
                  icon: '📝',
                  title: '注册信息',
                  description:
                    '• 用户名\n• 邮箱地址\n• 手机号码（可选）\n• 密码（加密存储）\n• 头像（可选）',
                },
                {
                  icon: '✍️',
                  title: '内容信息',
                  description:
                    '• 发布的诗词作品\n• 评论和回复\n• 个人简介\n• 收藏和点赞\n• 关注和粉丝',
                },
              ]}
            />
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              1.2 我们自动收集的信息
            </h3>
            <InfoTable
              headers={['信息类型', '具体内容', '收集目的']}
              rows={[
                [
                  '设备信息',
                  '设备型号、操作系统、浏览器类型、屏幕分辨率',
                  '优化用户体验、兼容性适配',
                ],
                [
                  '网络信息',
                  'IP地址、网络类型、运营商信息',
                  '安全防护、地域化服务',
                ],
                [
                  '使用信息',
                  '访问时间、页面浏览、功能使用、搜索记录',
                  '服务改进、个性化推荐',
                ],
                ['位置信息', '大致地理位置（基于IP）', '本地化内容、安全验证'],
              ]}
            />
          </div>

          <AlertBox type="info" title="⚠️ 特别说明">
            <p>
              我们不会收集您的敏感个人信息（如身份证号、银行卡号、生物识别信息等），除非法律法规要求或您明确同意。
            </p>
          </AlertBox>
        </div>
      </DocumentSection>

      <!-- 第二部分：我们如何使用信息 -->
      <DocumentSection title="第二部分 我们如何使用信息">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-lg font-semibold mb-3 text-base-content">
                🎯 核心服务
              </h3>
              <ul class="text-sm space-y-2 text-base-content/80">
                <li>• 账户注册和登录</li>
                <li>• 诗词发布和管理</li>
                <li>• 社交互动功能</li>
                <li>• 个人资料展示</li>
                <li>• 内容搜索和推荐</li>
              </ul>
            </div>
            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-lg font-semibold mb-3 text-base-content">
                🔧 服务优化
              </h3>
              <ul class="text-sm space-y-2 text-base-content/80">
                <li>• 分析用户行为模式</li>
                <li>• 改进产品功能</li>
                <li>• 优化界面设计</li>
                <li>• 提升系统性能</li>
                <li>• 修复技术问题</li>
              </ul>
            </div>
            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-lg font-semibold mb-3 text-base-content">
                🛡️ 安全保障
              </h3>
              <ul class="text-sm space-y-2 text-base-content/80">
                <li>• 身份验证和授权</li>
                <li>• 防范欺诈行为</li>
                <li>• 检测异常活动</li>
                <li>• 维护平台秩序</li>
                <li>• 应对安全威胁</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              2.1 个性化服务
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <p class="text-sm text-base-content/80 mb-3">
                基于您的使用习惯和偏好，我们可能为您提供个性化的内容推荐服务和：
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    内容推荐
                  </h5>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 相关诗词作品</li>
                    <li>• 感兴趣的作者</li>
                    <li>• 热门话题</li>
                    <li>• 文化活动</li>
                  </ul>
                </div>
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    功能优化
                  </h5>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 界面布局调整</li>
                    <li>• 功能快捷方式</li>
                    <li>• 通知偏好设置</li>
                    <li>• 主题风格选择</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第三部分：信息共享和披露 -->
      <DocumentSection title="第三部分 信息共享和披露">
        <div class="space-y-6">
          <div class="p-6 bg-base-300 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-4 text-base-content">
              🔒 基本原则
            </h3>
            <p class="text-base-content/80 mb-4">
              我们不会出售、出租或以其他方式向第三方披露您的个人信息，除非获得您的明确同意或符合以下情况：
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold text-base-content mb-2">法律要求</h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 遵守法律法规</li>
                  <li>• 配合司法调查</li>
                  <li>• 执行法院判决</li>
                  <li>• 维护国家安全</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-base-content mb-2">紧急情况</h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 保护用户生命安全</li>
                  <li>• 防范重大违法行为</li>
                  <li>• 维护公共利益</li>
                  <li>• 应对突发事件</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              3.1 合作伙伴
            </h3>
            <div class="overflow-x-auto">
              <InfoTable
                headers={['合作类型', '共享信息', '使用目的', '保护措施']}
                rows={[
                  [
                    '技术服务商',
                    '匿名化使用数据',
                    '系统维护、性能优化',
                    '数据脱敏、访问控制',
                  ],
                  [
                    '云服务提供商',
                    '加密存储数据',
                    '数据存储、备份',
                    '加密传输、安全认证',
                  ],
                  [
                    '分析服务商',
                    '统计分析数据',
                    '用户行为分析',
                    '数据匿名化处理',
                  ],
                ]}
              />
            </div>
          </div>

          <AlertBox type="success" title="🤝 合作伙伴管理">
            <p>我们会对所有合作伙伴进行严格的安全评估，并要求其：</p>
            <ul>
              <li>• 签署保密协议</li>
              <li>• 遵循最小必要原则</li>
              <li>• 采取安全保护措施</li>
              <li>• 定期接受安全审计</li>
            </ul>
          </AlertBox>
        </div></DocumentSection
      >

      <!-- 第四部分：信息存储和保护 -->
      <DocumentSection title="第四部分 信息存储和保护">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              4.1 存储位置
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <p class="text-base-content/80 mb-3">
                您的个人信息主要存储在中华人民共和国境内。如需跨境传输，我们将严格遵守相关法律法规：
              </p>
              <ul class="text-sm space-y-1 text-base-content/80">
                <li>• 获得相关部门批准</li>
                <li>• 确保数据安全</li>
                <li>• 告知用户并获得同意</li>
                <li>• 采取适当保护措施</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              4.2 保存期限
            </h3>
            <div class="overflow-x-auto">
              <table
                class="w-full border-collapse border border-base-300 text-sm"
              >
                <thead>
                  <tr class="bg-base-200">
                    <th
                      class="border border-base-300 px-4 py-2 text-left text-base-content"
                      >信息类型</th
                    >
                    <th
                      class="border border-base-300 px-4 py-2 text-left text-base-content"
                      >保存期限</th
                    >
                    <th
                      class="border border-base-300 px-4 py-2 text-left text-base-content"
                      >处理方式</th
                    >
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >账户信息</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >账户存续期间</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >注销后删除或匿名化</td
                    >
                  </tr>
                  <tr class="bg-base-100">
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >内容信息</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >发布后永久保存</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >用户可主动删除</td
                    >
                  </tr>
                  <tr>
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >日志信息</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >6个月</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >用于安全分析</td
                    >
                  </tr>
                  <tr class="bg-base-100">
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >设备信息</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >12个月</td
                    >
                    <td
                      class="border border-base-300 px-4 py-2 text-base-content/80"
                      >用于服务优化</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              4.3 安全措施
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold mb-2 text-base-content">技术措施</h4>
                <ul
                  class="list-disc pl-6 space-y-1 text-sm text-base-content/80"
                >
                  <li>HTTPS加密传输</li>
                  <li>数据库加密存储</li>
                  <li>防火墙和入侵检测</li>
                  <li>定期安全扫描</li>
                  <li>数据备份和恢复</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold mb-2 text-base-content">管理措施</h4>
                <ul
                  class="list-disc pl-6 space-y-1 text-sm text-base-content/80"
                >
                  <li>员工安全培训</li>
                  <li>数据访问审批</li>
                  <li>安全事件响应</li>
                  <li>第三方安全评估</li>
                  <li>合规性审计</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第五部分：您的权利 -->
      <DocumentSection title="第五部分 您的权利">
        <div class="space-y-6">
          <p class="leading-relaxed text-lg">
            我们非常重视您对个人信息的关注，并尽全力保护您对于个人信息的权利。您拥有以下权利：
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-xl font-semibold mb-4 text-base-content">
                🔍 访问权
              </h3>
              <p class="text-sm text-base-content/80 mb-3">
                您有权了解我们收集、使用您个人信息的情况
              </p>
              <ul class="text-sm space-y-1 text-base-content/80">
                <li>• 查看个人资料</li>
                <li>• 了解数据处理目的</li>
                <li>• 查询数据共享情况</li>
                <li>• 获取数据副本</li>
              </ul>
            </div>

            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-xl font-semibold mb-4 text-base-content">
                ✏️ 更正权
              </h3>
              <p class="text-sm text-base-content/80 mb-3">
                您有权要求我们更正或补充您的个人信息
              </p>
              <ul class="text-sm space-y-1 text-base-content/80">
                <li>• 修改个人资料</li>
                <li>• 更新联系方式</li>
                <li>• 纠正错误信息</li>
                <li>• 补充缺失信息</li>
              </ul>
            </div>

            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-xl font-semibold mb-4 text-base-content">
                🗑️ 删除权
              </h3>
              <p class="text-sm text-base-content/80 mb-3">
                在特定情况下，您有权要求我们删除您的个人信息
              </p>
              <ul class="text-sm space-y-1 text-base-content/80">
                <li>• 注销账户</li>
                <li>• 删除发布内容</li>
                <li>• 清除浏览记录</li>
                <li>• 撤销授权同意</li>
              </ul>
            </div>

            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <h3 class="text-xl font-semibold mb-4 text-base-content">
                📱 携带权
              </h3>
              <p class="text-sm text-base-content/80 mb-3">
                您有权获取您的个人信息副本
              </p>
              <ul class="text-sm space-y-1 text-base-content/80">
                <li>• 导出个人数据</li>
                <li>• 获取结构化数据</li>
                <li>• 转移到其他服务</li>
                <li>• 备份重要信息</li>
              </ul>
            </div>
          </div>

          <div class="p-6 bg-base-200 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              ⚙️ 如何行使您的权利
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl mb-2">🖥️</div>
                <h4 class="font-semibold mb-1 text-base-content">在线操作</h4>
                <p class="text-sm text-base-content/80">
                  登录账户，在设置页面进行操作
                </p>
              </div>
              <div class="text-center">
                <div class="text-2xl mb-2">📧</div>
                <h4 class="font-semibold mb-1 text-base-content">邮件申请</h4>
                <p class="text-sm text-base-content/80">
                  发送邮件至privacy@poetryclub.com
                </p>
              </div>
              <div class="text-center">
                <div class="text-2xl mb-2">💬</div>
                <h4 class="font-semibold mb-1 text-base-content">客服咨询</h4>
                <p class="text-sm text-base-content/80">
                  联系在线客服或拨打客服电话
                </p>
              </div>
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第六部分：Cookie和类似技术 -->
      <DocumentSection title="第六部分 Cookie和类似技术">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              6.1 什么是Cookie
            </h3>
            <p class="leading-relaxed mb-4 text-base-content/80">
              Cookie是一种可以让网站服务器将数据存储在客户端或从客户端中读取数据的中性技术。Cookie文件是存储了一些与用户访问网站有关信息的文件，格式为.txt。
            </p>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              6.2 我们如何使用Cookie
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  🔐 必要Cookie
                </h4>
                <p class="text-sm text-base-content/80 mb-2">
                  这些Cookie对于网站正常运行是必需的
                </p>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 保持登录状态</li>
                  <li>• 记住用户偏好</li>
                  <li>• 安全验证</li>
                  <li>• 购物车功能</li>
                </ul>
              </div>
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  📊 分析Cookie
                </h4>
                <p class="text-sm text-base-content/80 mb-2">
                  帮助我们了解网站使用情况
                </p>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 访问统计</li>
                  <li>• 用户行为分析</li>
                  <li>• 性能监控</li>
                  <li>• 错误追踪</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              6.3 如何管理Cookie
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <p class="text-sm text-base-content/80 mb-3">
                您可以通过浏览器设置来管理Cookie：
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    浏览器设置
                  </h5>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 阻止所有Cookie</li>
                    <li>• 删除现有Cookie</li>
                    <li>• 设置Cookie过期时间</li>
                    <li>• 选择性接受Cookie</li>
                  </ul>
                </div>
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    注意事项
                  </h5>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 禁用Cookie可能影响功能</li>
                    <li>• 某些服务可能无法正常使用</li>
                    <li>• 需要重新登录</li>
                    <li>• 个性化设置可能丢失</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第七部分：未成年人保护 -->
      <DocumentSection title="第七部分 未成年人保护">
        <div class="space-y-6">
          <div
            class="p-6 bg-base-300 rounded-lg border-l-4 border-base-300"
          >
            <h3 class="text-xl font-semibold mb-4 text-base-content">
              👶 特别保护
            </h3>
            <p class="text-base-content/80 mb-4">
              我们非常重视未成年人个人信息的保护。如果您是未成年人，建议您请您的父母或监护人仔细阅读本隐私政策，并在征得您的父母或监护人同意后使用我们的服务或向我们提供信息。
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold text-base-content mb-2">
                  监护人权利
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 查看孩子的个人信息</li>
                  <li>• 要求更正或删除信息</li>
                  <li>• 拒绝进一步收集信息</li>
                  <li>• 监督孩子的使用行为</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-base-content mb-2">
                  我们的承诺
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 不主动收集未成年人信息</li>
                  <li>• 发现后立即删除</li>
                  <li>• 提供家长控制功能</li>
                  <li>• 加强内容审核</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h4 class="font-semibold text-base-content mb-2">📞 联系我们</h4>
            <p class="text-sm text-base-content/80">
              如果您是未成年人的监护人，对我们收集和使用未成年人个人信息的情况有任何疑问，请通过以下方式联系我们：
            </p>
            <ul class="text-sm space-y-1 text-base-content/80 mt-2">
              <li>• 邮箱：parents@poetryclub.com</li>
              <li>• 电话：400-123-4567</li>
              <li>• 在线客服：工作日9:00-18:00</li>
            </ul>
          </div>
        </div>
      </DocumentSection>

      <!-- 第八部分：政策更新 -->
      <DocumentSection title="第八部分 政策更新">
        <div class="space-y-6">
          <div class="p-6 bg-base-300 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-4 text-base-content">
              📝 更新机制
            </h3>
            <p class="text-base-content/80 mb-4">
              我们可能会不时更新本隐私政策。当我们对隐私政策进行重大变更时，我们会通过以下方式通知您：
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="text-center p-4 bg-base-200 rounded-lg border border-base-300"
              >
                <div class="text-2xl mb-2">🔔</div>
                <h4 class="font-semibold mb-1 text-base-content">站内通知</h4>
                <p class="text-sm text-base-content/80">
                  在网站显著位置发布公告
                </p>
              </div>
              <div
                class="text-center p-4 bg-base-200 rounded-lg border border-base-300"
              >
                <div class="text-2xl mb-2">📧</div>
                <h4 class="font-semibold mb-1 text-base-content">邮件通知</h4>
                <p class="text-sm text-base-content/80">
                  向注册邮箱发送更新通知
                </p>
              </div>
              <div
                class="text-center p-4 bg-base-200 rounded-lg border border-base-300"
              >
                <div class="text-2xl mb-2">📱</div>
                <h4 class="font-semibold mb-1 text-base-content">推送通知</h4>
                <p class="text-sm text-base-content/80">
                  通过应用推送重要变更
                </p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h4 class="font-semibold text-base-content mb-2">⏰ 生效时间</h4>
            <p class="text-sm text-base-content/80">
              更新后的隐私政策将在发布后30天生效。如果您在此期间继续使用我们的服务，即表示您同意接受更新后的隐私政策。如果您不同意更新后的政策，您可以停止使用我们的服务。
            </p>
          </div>
        </div>
      </DocumentSection>

      <!-- 第九部分：联系我们 -->
      <DocumentSection title="第九部分 联系我们">
        <div class="space-y-6">
          <div class="p-6 bg-base-300 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-4 text-base-content">
              📞 联系方式
            </h3>
            <p class="text-base-content/80 mb-4">
              如果您对本隐私政策有任何疑问、意见或建议，或者需要行使您的个人信息权利，请通过以下方式联系我们：
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-base-content mb-3">
                  📧 邮件联系
                </h4>
                <ul class="space-y-2 text-sm text-base-content/80">
                  <li><strong>隐私问题：</strong> privacy@poetryclub.com</li>
                  <li><strong>一般咨询：</strong> contact@poetryclub.com</li>
                  <li><strong>技术支持：</strong> support@poetryclub.com</li>
                  <li><strong>商务合作：</strong> business@poetryclub.com</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-base-content mb-3">
                  🏢 其他联系方式
                </h4>
                <ul class="space-y-2 text-sm text-base-content/80">
                  <li><strong>客服电话：</strong> 400-123-4567</li>
                  <li><strong>工作时间：</strong> 周一至周五 9:00-18:00</li>
                  <li><strong>通信地址：</strong> 北京市朝阳区诗词大厦8层</li>
                  <li><strong>邮政编码：</strong> 100000</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h4 class="font-semibold text-base-content mb-2">⚡ 响应时间</h4>
            <p class="text-sm text-base-content/80">
              我们将在收到您的请求后15个工作日内回复。对于复杂问题，我们可能需要更长时间，但不会超过30个工作日。我们会及时向您说明处理进度。
            </p>
          </div>
        </div>
      </DocumentSection>
    </div>

    <!-- 页脚装饰 -->
    <div class="text-center mt-8 pt-6 border-t border-base-300">
      <p class="text-base-content/60 font-kai italic text-lg">
        "诚者，天之道也；思诚者，人之道也"
      </p>
      <p class="text-base-content/60 text-sm mt-2">— 《孟子》</p>
    </div>
  </div>
</div>
