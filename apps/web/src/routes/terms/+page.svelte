<script lang="ts">
  import {
    DocumentPageHeader,
    DocumentSection,
    FeatureGrid,
    IntroSection,
    AlertBox,
    ProcessFlow,
  } from '$lib/components';
  import InfoTable from '$lib/components/InfoTable.svelte';
</script>

<svelte:head>
  <title>用户协议 - 回中诗社</title>
  <meta
    name="description"
    content="回中诗社用户协议 - 规范使用，共建和谐诗词社区"
  />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="card bg-base-200 shadow-xl p-8 rounded-xl">
    <DocumentPageHeader
      title="用户协议"
      lastUpdated="2024年1月1日"
      effectiveDate="2024年1月1日"
    />

    <div class="prose prose-amber max-w-none text-base-content">
      <!-- 引言 -->
      <IntroSection title="引言">
        <p class="leading-relaxed text-lg">
          欢迎使用回中诗社！回中诗社（以下简称"本平台"或"我们"）是一个专注于中华诗词文化传承与分享的在线平台。本用户协议（以下简称"本协议"）是您与回中诗社之间关于您使用回中诗社服务所订立的协议。
        </p>
        <p class="leading-relaxed mt-4">
          请您务必仔细阅读并充分理解本协议各条款，特别是免责或者限制责任的条款。如果您不同意本协议的任何条款，请不要使用回中诗社的服务。
        </p>
      </IntroSection>

      <!-- 第一部分：协议的接受和生效 -->
      <DocumentSection
        title="第一部分 协议的接受和生效"
        borderColor="border-base-300"
        textColor="text-base-content"
      >
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              1.1 协议的构成
            </h3>
            <div class="card bg-base-200 shadow-sm">
              <div class="card-body p-4">
                <p class="text-base-content/70 mb-3">
                  本协议包括但不限于以下内容：
                </p>
                <ul class="text-sm space-y-1 text-base-content/70">
                  <li>• 本用户协议正文</li>
                  <li>• 隐私政策</li>
                  <li>• 社区公约</li>
                  <li>• 版权声明</li>
                  <li>• 其他相关规则和声明</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              1.2 协议的接受
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card bg-base-200 shadow-sm">
                <div class="card-body p-4">
                  <h4 class="card-title text-base font-semibold mb-2">
                    📝 注册接受
                  </h4>
                  <p class="text-sm text-base-content/70">
                    当您点击"同意"按钮并完成注册程序时，即表示您已阅读、理解并同意接受本协议的全部条款。
                  </p>
                </div>
              </div>
              <div class="card bg-base-200 shadow-sm">
                <div class="card-body p-4">
                  <h4 class="card-title text-base font-semibold mb-2">
                    🖱️ 使用接受
                  </h4>
                  <p class="text-sm text-base-content/70">
                    当您使用回中诗社的任何服务时，即表示您已阅读、理解并同意接受本协议的约束。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertBox type="warning" title="⚠️ 重要提醒">
            <p>
              如果您未满18周岁，请在法定监护人的陪同下阅读本协议，并特别注意未成年人使用条款。
            </p>
          </AlertBox>
        </div>
      </DocumentSection>

      <!-- 第二部分：服务说明 -->
      <DocumentSection
        title="第二部分 服务说明"
        borderColor="border-base-300"
        textColor="text-base-content"
      >
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              2.1 服务内容
            </h3>
            <FeatureGrid
              columns="grid-cols-1 md:grid-cols-3"
              bgColor="bg-base-300"
              borderColor="border-base-300"
              titleColor="text-base-content"
              descColor="text-base-content/80"
              features={[
                {
                  icon: '✍️',
                  title: '创作服务',
                  description:
                    '• 诗词创作和发布\n• 作品编辑和管理\n• 创作工具和模板\n• 格律检测和建议\n• 作品分类和标签',
                },
                {
                  icon: '👥',
                  title: '社交服务',
                  description:
                    '• 关注和粉丝系统\n• 评论和互动\n• 点赞和收藏\n• 私信和聊天\n• 社群和圈子',
                },
                {
                  icon: '📚',
                  title: '学习服务',
                  description:
                    '• 诗词知识库\n• 在线课程\n• 名家作品赏析\n• 写作技巧指导\n• 文化背景介绍',
                },
              ]}
            />
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              2.2 服务特点
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    🎯 专业性
                  </h5>
                  <p class="text-sm text-base-content/80">
                    专注于中华诗词文化，提供专业的创作环境和学习资源。
                  </p>
                </div>
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    🌐 开放性
                  </h5>
                  <p class="text-sm text-base-content/80">
                    欢迎所有热爱诗词的用户参与，共同建设诗词文化社区。
                  </p>
                </div>
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    🛡️ 安全性
                  </h5>
                  <p class="text-sm text-base-content/80">
                    采用先进的技术手段，保障用户信息安全和平台稳定运行。
                  </p>
                </div>
                <div>
                  <h5 class="font-semibold text-base-content mb-2">
                    📱 便捷性
                  </h5>
                  <p class="text-sm text-base-content/80">
                    支持多平台访问，随时随地享受诗词创作和分享的乐趣。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第三部分：用户账户 -->
      <DocumentSection title="第三部分 用户账户">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              3.1 账户注册
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <h4 class="font-semibold text-base-content mb-3">注册要求</h4>
              <ul class="text-sm space-y-1 text-base-content/80">
                <li>• 提供真实、准确、完整的个人信息</li>
                <li>• 选择合适的用户名，不得侵犯他人权益</li>
                <li>• 设置安全的密码，定期更新</li>
                <li>• 同意本协议和隐私政策</li>
                <li>• 年满13周岁（未满18周岁需监护人同意）</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              3.2 账户安全
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  🔐 用户责任
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 妥善保管账户信息</li>
                  <li>• 不得转让或出借账户</li>
                  <li>• 发现异常及时联系客服</li>
                  <li>• 对账户行为承担责任</li>
                </ul>
              </div>
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  🛡️ 平台保障
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 提供安全登录机制</li>
                  <li>• 监控异常登录行为</li>
                  <li>• 提供账户找回服务</li>
                  <li>• 定期安全提醒</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              3.3 账户管理
            </h3>
            <div class="overflow-x-auto">
              <InfoTable
                headers={['操作类型', '用户权限', '平台权限']}
                rows={[
                  ['信息修改', '可自主修改个人资料', '审核违规信息'],
                  ['账户注销', '可申请注销账户', '保留必要信息'],
                  ['违规处理', '可申诉处理结果', '可限制或封禁账户'],
                ]}
              />
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第四部分：用户行为规范 -->
      <DocumentSection title="第四部分 用户行为规范">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              4.1 基本原则
            </h3>
            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <p class="text-base-content/80 mb-4">
                在使用回中诗社服务时，您应当遵守以下基本原则：
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold text-base-content mb-2">
                    🏛️ 法律合规
                  </h4>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 遵守中华人民共和国法律法规</li>
                    <li>• 不从事违法犯罪活动</li>
                    <li>• 尊重社会公德</li>
                    <li>• 维护网络安全</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-base-content mb-2">
                    🎭 文化传承
                  </h4>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 弘扬中华优秀传统文化</li>
                    <li>• 传播正能量内容</li>
                    <li>• 尊重文化多样性</li>
                    <li>• 促进文化交流</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              4.2 禁止行为
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  🚫 内容禁止
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 发布违法违规内容</li>
                  <li>• 传播虚假信息</li>
                  <li>• 侵犯他人知识产权</li>
                  <li>• 发布色情、暴力内容</li>
                  <li>• 恶意攻击他人</li>
                </ul>
              </div>
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  ⚡ 行为禁止
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 恶意刷屏或灌水</li>
                  <li>• 使用外挂或作弊软件</li>
                  <li>• 恶意注册多个账户</li>
                  <li>• 干扰平台正常运行</li>
                  <li>• 商业广告和垃圾信息</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              4.3 违规处理
            </h3>
            <div class="overflow-x-auto">
              <InfoTable
                headers={['违规程度', '处理措施', '处理期限', '申诉渠道']}
                rows={[
                  ['轻微违规', '警告、删除内容', '即时生效', '站内申诉'],
                  ['一般违规', '限制功能、临时封禁', '1-7天', '邮件申诉'],
                  ['严重违规', '永久封禁', '永久', '客服申诉'],
                ]}
              />
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第五部分：知识产权 -->
      <DocumentSection title="第五部分 知识产权">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              5.1 平台知识产权
            </h3>
            <div class="p-6 bg-base-300 rounded-lg border border-base-300">
              <p class="text-base-content/80 mb-4">
                回中诗社的商标、标识、界面设计、程序代码等均受知识产权法保护，未经授权不得使用。
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-semibold text-base-content mb-2">
                    🏷️ 商标权
                  </h4>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• "回中诗社"商标</li>
                    <li>• 相关图形标识</li>
                    <li>• 产品名称</li>
                    <li>• 宣传标语</li>
                  </ul>
                </div>
                <div>
                  <h4 class="font-semibold text-base-content mb-2">
                    💻 著作权
                  </h4>
                  <ul class="text-sm space-y-1 text-base-content/80">
                    <li>• 网站设计</li>
                    <li>• 程序代码</li>
                    <li>• 文档资料</li>
                    <li>• 音视频内容</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              5.2 用户内容权利
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  ✍️ 原创作品
                </h4>
                <p class="text-sm text-base-content/80 mb-2">
                  您对自己创作的原创诗词作品享有著作权
                </p>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 署名权</li>
                  <li>• 修改权</li>
                  <li>• 发表权</li>
                  <li>• 复制权</li>
                </ul>
              </div>
              <div
                class="p-4 bg-base-300 rounded-lg border border-base-300"
              >
                <h4 class="font-semibold text-base-content mb-2">
                  📄 授权使用
                </h4>
                <p class="text-sm text-base-content/80 mb-2">
                  发布作品时，您授权平台在以下范围内使用
                </p>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 平台内展示</li>
                  <li>• 推广宣传</li>
                  <li>• 格式转换</li>
                  <li>• 技术处理</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              5.3 侵权处理
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <h4 class="font-semibold text-base-content mb-3">
                🚨 投诉流程
              </h4>
              <ProcessFlow
                steps={[
                  {
                    icon: '📝',
                    title: '提交投诉',
                    description: '发送侵权证明材料',
                  },
                  {
                    icon: '🔍',
                    title: '审核处理',
                    description: '3个工作日内审核',
                  },
                  {
                    icon: '⚡',
                    title: '执行措施',
                    description: '删除或限制访问',
                  },
                  {
                    icon: '📧',
                    title: '结果通知',
                    description: '邮件通知处理结果',
                  },
                ]}
                columns="grid-cols-1 md:grid-cols-4"
              />
            </div>
          </div>
        </div>
      </DocumentSection>

      <!-- 第六部分：免责声明 -->
      <DocumentSection title="第六部分 免责声明">
        <div class="space-y-6">
          <div class="p-6 bg-base-300 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-4 text-base-content">
              ⚠️ 服务免责
            </h3>
            <p class="text-base-content/80 mb-4">
              回中诗社仅作为信息发布和交流平台，对以下情况不承担责任：
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold text-base-content mb-2">
                  📝 内容免责
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 用户发布的内容真实性</li>
                  <li>• 第三方链接的安全性</li>
                  <li>• 用户间的纠纷争议</li>
                  <li>• 内容的版权问题</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-base-content mb-2">
                  🔧 技术免责
                </h4>
                <ul class="text-sm space-y-1 text-base-content/80">
                  <li>• 不可抗力导致的服务中断</li>
                  <li>• 网络故障或系统维护</li>
                  <li>• 第三方攻击或病毒</li>
                  <li>• 用户设备或网络问题</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h4 class="font-semibold text-base-content mb-2">🛡️ 责任限制</h4>
            <p class="text-sm text-base-content/80">
              在法律允许的最大范围内，回中诗社对任何间接、偶然、特殊或后果性损害不承担责任，包括但不限于利润损失、数据丢失等。
            </p>
          </div>
        </div>
      </DocumentSection>

      <!-- 第七部分：协议修改 -->
      <DocumentSection title="第七部分 协议修改">
        <div class="space-y-6">
          <div class="p-6 bg-base-300 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-4 text-base-content">
              📝 修改权利
            </h3>
            <p class="text-base-content/80 mb-4">
              回中诗社有权根据法律法规变化、业务发展需要等情况修改本协议。修改后的协议将通过以下方式通知用户：
            </p>

            <ProcessFlow
              steps={[
                {
                  icon: '🔔',
                  title: '站内公告',
                  description: '在网站首页发布公告',
                },
                {
                  icon: '📧',
                  title: '邮件通知',
                  description: '向注册邮箱发送通知',
                },
                {
                  icon: '📱',
                  title: '应用推送',
                  description: '通过移动应用推送',
                },
              ]}
              columns="grid-cols-1 md:grid-cols-3"
            />
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h4 class="font-semibold text-base-content mb-2">⏰ 生效时间</h4>
            <p class="text-sm text-base-content/80">
              修改后的协议将在公布后30天生效。如果您在此期间继续使用服务，即表示同意修改后的协议。如不同意，您可以停止使用服务并注销账户。
            </p>
          </div>
        </div>
      </DocumentSection>

      <!-- 第八部分：争议解决 -->
      <DocumentSection title="第八部分 争议解决">
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              8.1 适用法律
            </h3>
            <div class="p-4 bg-base-300 rounded-lg border border-base-300">
              <p class="text-base-content/80">
                本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如发生争议，双方应友好协商解决。
              </p>
            </div>
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h3 class="text-xl font-semibold mb-3 text-base-content">
              8.2 争议处理
            </h3>
            <ProcessFlow
              steps={[
                {
                  icon: '🤝',
                  title: '友好协商',
                  description: '优先通过协商方式解决争议',
                },
                {
                  icon: '⚖️',
                  title: '仲裁解决',
                  description: '提交北京仲裁委员会仲裁',
                },
                {
                  icon: '🏛️',
                  title: '司法诉讼',
                  description: '向北京市朝阳区人民法院起诉',
                },
              ]}
              columns="grid-cols-1 md:grid-cols-3"
            />
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
              如果您对本协议有任何疑问或建议，请通过以下方式联系我们：
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="font-semibold text-base-content mb-3">
                  📧 邮件联系
                </h4>
                <ul class="space-y-2 text-sm text-base-content/80">
                  <li><strong>法务咨询：</strong> legal@poetryclub.com</li>
                  <li><strong>用户服务：</strong> service@poetryclub.com</li>
                  <li><strong>技术支持：</strong> support@poetryclub.com</li>
                  <li><strong>商务合作：</strong> business@poetryclub.com</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-base-content mb-3">
                  🏢 其他联系方式
                </h4>
                <ul class="space-y-2 text-sm text-base-content/80">
                  <li><strong>客服热线：</strong> 400-123-4567</li>
                  <li><strong>工作时间：</strong> 周一至周五 9:00-18:00</li>
                  <li><strong>公司地址：</strong> 北京市朝阳区诗词大厦8层</li>
                  <li><strong>邮政编码：</strong> 100000</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="p-4 bg-base-300 rounded-lg border border-base-300">
            <h4 class="font-semibold text-base-content mb-2">⚡ 响应承诺</h4>
            <p class="text-sm text-base-content/80">
              我们承诺在收到您的咨询后24小时内回复，复杂问题将在3个工作日内给出解决方案。
            </p>
          </div>
        </div>
      </DocumentSection>
    </div>

    <!-- 页脚装饰 -->
    <div class="text-center mt-8 pt-6 border-t border-base-300">
      <p class="text-base-content/60 font-kai italic text-lg">
        "文以载道，诗以言志，歌以咏言"
      </p>
      <p class="text-base-content/60 text-sm mt-2">— 《尚书·尧典》</p>
    </div>
  </div>
</div>
