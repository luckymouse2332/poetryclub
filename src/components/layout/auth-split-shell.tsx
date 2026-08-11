/** 不是上游组件：认证页面的桌面说明区与表单区骨架。 */

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

type AuthSplitShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
  children: React.ReactNode;
}>;

export function AuthSplitShell({ eyebrow, title, description, note, children }: AuthSplitShellProps) {
  return (
    <PageContainer className="flex flex-1 items-center py-12 md:py-16">
      <div className="grid w-full items-start gap-10 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(26rem,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-12">
          <PageHeader eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-8 h-px w-12 bg-seal" aria-hidden="true" />
          {note ? <p className="mt-5 max-w-md font-serif text-body leading-reading text-subtle">{note}</p> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </PageContainer>
  );
}
