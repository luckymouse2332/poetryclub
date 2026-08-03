import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input, inputBaseClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AdminFilterSelect = Readonly<{
  name: string;
  label: string;
  value?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}>;

type AdminFilterFormProps = Readonly<{
  basePath: string;
  searchPlaceholder: string;
  selects: ReadonlyArray<AdminFilterSelect>;
  q?: string;
  /** 存在任一筛选条件时显示“清除筛选”。 */
  hasActiveFilter: boolean;
}>;

/**
 * 管理列表的 GET 筛选表单（Server Component）。提交即回到第 1 页，
 * 不依赖客户端 JS；筛选条件写入 query，供服务端重新取数。
 * 下拉框使用原生 `<select>` 复用 Input 的表面样式，不引入额外 UI 库。
 */
export function AdminFilterForm({
  basePath,
  searchPlaceholder,
  selects,
  q,
  hasActiveFilter,
}: AdminFilterFormProps) {
  return (
    <form
      method="get"
      action={basePath}
      className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end"
    >
      <input type="hidden" name="page" value="1" />
      {selects.map((select) => (
        <div key={select.name} className="min-w-0 flex-1 lg:max-w-44">
          <label
            htmlFor={`filter-${select.name}`}
            className="mb-1 block text-caption font-medium text-subtle"
          >
            {select.label}
          </label>
          <select
            id={`filter-${select.name}`}
            name={select.name}
            defaultValue={select.value ?? ""}
            className={cn(inputBaseClasses, "h-control")}
          >
            <option value="">全部</option>
            {select.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="min-w-0 flex-1">
        <label
          htmlFor="filter-q"
          className="mb-1 block text-caption font-medium text-subtle"
        >
          搜索
        </label>
        <Input
          id="filter-q"
          name="q"
          type="search"
          placeholder={searchPlaceholder}
          defaultValue={q}
          className="lg:max-w-72"
        />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" size="sm">
          筛选
        </Button>
        {hasActiveFilter ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={basePath}>清除筛选</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}
