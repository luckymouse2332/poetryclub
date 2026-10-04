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
    <PageContainer width="narrow" className="flex flex-1 py-12 md:py-16 lg:max-w-content">
      <div className="grid w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
        <div data-slot="auth-introduction" className="mb-8 min-w-0 border-b border-border pb-8 lg:mb-0 lg:flex lg:flex-col lg:justify-center lg:border-r lg:border-b-0 lg:py-8 lg:pr-12">
          <PageHeader eyebrow={eyebrow} title={title} description={description} />
          {note ? <p className="mt-5 text-label leading-reading text-subtle">{note}</p> : null}
        </div>
        <div data-slot="auth-form-region" className="min-w-0 lg:w-full lg:max-w-narrow lg:self-center lg:justify-self-end">{children}</div>
      </div>
    </PageContainer>
  );
}
