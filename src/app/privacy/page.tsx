import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "隐私政策",
};

export default function PrivacyPage() {
  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="站点说明"
        title="隐私政策"
        description="本页面向校园用户，说明回中诗社当前真实收集和处理的数据。本页是使用说明，不是法律文件，也不构成任何法律保证。"
      />
      <div className="mt-8 divide-y divide-border-subtle">
        <Section title="我们处理哪些信息" className="py-8">
          <ul className="list-disc space-y-3 pl-6 text-body text-subtle">
            <li>注册账号时，我们处理你填写的昵称（名称）和邮箱。</li>
            <li>
              密码只用于完成认证请求，并由 Better Auth 安全哈希后保存；服务端不会保存可还原的明文密码，页面也不会显示密码。
            </li>
            <li>登录后，一个 HttpOnly 会话 Cookie 用于保持登录状态。</li>
            <li>
              服务端为保障安全，可能处理必要的请求元数据，但这些信息不会在浏览器中展示。
            </li>
            <li>
              发布诗作、评论或回复时，我们保存你提交的纯文本、作者账号关联、所属作品、创建与编辑时间；评论治理会保存状态、原因、操作时间和审计记录。
            </li>
          </ul>
        </Section>
        <Section title="我们如何使用这些信息" className="py-8">
          <p className="text-body text-subtle">
            这些信息仅用于账号认证、安全保障和提供当前已实现的服务。当前我们不使用广告跟踪，也不会出售你的个人信息。
          </p>
        </Section>
        <Section title="你可以在哪里看到这些信息" className="py-8">
          <div className="space-y-4 text-body text-subtle">
            <p>
              账号页面只向当前登录用户展示最少的个人资料，包括显示名称、邮箱和注册时间。
            </p>
            <p>
              当前还没有自助删除或导出账号的入口。如需处理相关请求，可通过校园内的已知渠道联系站点维护者。
            </p>
          </div>
        </Section>
        <Section title="发布公开内容时的提醒" className="py-8">
          <p className="text-body text-subtle">
            作品、评论与回复可能按作品访问范围展示给游客或正常成员。请勿在这些内容中提交邮箱、联系方式、住址、账号凭据或其他敏感个人信息。评论通知不保存评论正文，也不会保存成员作品的受保护标题。
          </p>
        </Section>
        <Section title="政策变更" className="py-8">
          <p className="text-body text-subtle">
            政策如有变化，我们会更新本页的内容和更新日期。
          </p>
        </Section>
      </div>
      <p className="text-caption text-subtle">更新日期：2026年8月22日</p>
    </PageContainer>
  );
}
