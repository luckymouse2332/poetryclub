import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";

export const metadata: Metadata = {
  title: "使用条款",
};

export default function TermsPage() {
  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="站点说明"
        title="使用条款"
        description="回中诗社面向校园用户的使用条款。本页只说明当前真实可用的能力，不伪装尚未实现的功能。"
      />
      <div className="mt-8 divide-y divide-border-subtle">
        <Section title="当前可用的功能" className="py-8">
          <p className="text-body text-subtle">
            目前已经开放账号注册、登录、账户页面、诗作的阅读与发布管理，以及作品评论和一级回复。点赞、收藏和分享仍未开放。
          </p>
        </Section>
        <Section title="账号与安全" className="py-8">
          <div className="space-y-4 text-body text-subtle">
            <p>请使用本人账号，并妥善保护登录凭据，不要转借他人使用。</p>
            <p>
              遇到账号问题，可通过校园内的已知渠道联系站点维护者。
            </p>
          </div>
        </Section>
        <Section title="发布内容的基本原则" className="py-8">
          <p className="text-body text-subtle">
            诗作、创作背景、评论与回复都应是你有权分享的内容。请尊重同学隐私，不要提交骚扰、违法、冒用他人身份或泄露敏感信息的内容。管理员可以填写原因后隐藏不合适的评论，作者删除评论后正文不能恢复。
          </p>
        </Section>
        <Section title="站点维护与变更" className="py-8">
          <p className="text-body text-subtle">
            站点可能进行维护与更新，重要规则以本页最新版本为准。
          </p>
        </Section>
      </div>
      <p className="text-caption text-subtle">更新日期：2026年8月22日</p>
    </PageContainer>
  );
}
