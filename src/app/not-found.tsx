import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-page py-section text-center">
      <p className="text-label font-medium text-subtle">404</p>
      <h1 className="mt-3 font-serif text-page-title font-medium tracking-tight">
        页面不存在
      </h1>
      <p className="mt-3 text-body text-subtle">
        你访问的页面不存在，或已被移动。
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        返回首页
      </Link>
    </div>
  );
}
