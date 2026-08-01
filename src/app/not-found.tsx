import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">页面不存在</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        你访问的页面不存在，或已被移动。
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        返回首页
      </Link>
    </div>
  );
}
