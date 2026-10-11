"use client";
/** 不是上游组件：仅由 E2E 路由使用的现有组件组合，不包含业务或数据访问。 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioOption } from "@/components/radio-option";
import { FormField } from "@/components/ui/form-field";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Surface } from "@/components/ui/surface";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
function Specimen({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section
      data-component={name}
      className="min-w-0 border-t border-border py-8"
    >
      <h2 className="mb-6 font-serif text-section-title">{name}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
export function ComponentShowcase() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState(false);
  const [scope, setScope] = useState("public");
  // Tests wait for hydration before screenshots temporarily alter caret styles.
  useEffect(() => {
    rootRef.current?.setAttribute("data-ready", "true");
  }, []);
  return (
    <div ref={rootRef} data-component-root className="space-y-8">
      <Specimen name="Button">
        {(["primary", "secondary", "ghost", "danger"] as const).map(
          (variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-4">
              {(["default", "sm", "lg"] as const).map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} · {size}
                </Button>
              ))}
              <Button
                variant={variant}
                size="icon"
                aria-label={`${variant} 图标按钮`}
              >
                <MoreHorizontal />
              </Button>
              <Button variant={variant} disabled>
                不可操作
              </Button>
              <Button variant={variant} loading>
                正在保存
              </Button>
            </div>
          ),
        )}
        <Button asChild variant="ghost">
          <a href="#preview-card">查看纸页</a>
        </Button>
      </Specimen>
      <Specimen name="IconButton">
        <div className="flex gap-4">
          <IconButton aria-label="更多操作" variant="secondary">
            <MoreHorizontal />
          </IconButton>
          <IconButton aria-label="不可操作" disabled>
            <MoreHorizontal />
          </IconButton>
          <IconButton aria-label="正在处理" loading>
            <MoreHorizontal />
          </IconButton>
        </div>
      </Specimen>
      <Specimen name="Badge">
        <div className="flex flex-wrap gap-3">
          {(
            [
              "neutral",
              "primary",
              "seal",
              "success",
              "warning",
              "danger",
            ] as const
          ).map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Specimen>
      <Specimen name="Input">
        <Input aria-label="普通输入" placeholder="输入作品标题" />
        <Input
          aria-label="错误输入"
          aria-invalid="true"
          defaultValue="错误状态"
        />
        <Input aria-label="禁用输入" disabled defaultValue="当前不可编辑" />
        <Input aria-label="只读输入" readOnly defaultValue="只读内容" />
      </Specimen>
      <Specimen name="Textarea">
        <Textarea
          aria-label="诗歌正文"
          className="font-serif"
          defaultValue={"一些随手写下的诗，\n和仍然记得的事情。"}
        />
        <Textarea
          aria-label="错误正文"
          aria-invalid="true"
          placeholder="请补充正文"
        />
        <Textarea aria-label="禁用正文" disabled defaultValue="当前不可编辑" />
      </Specimen>
      <Specimen name="Label">
        <Label htmlFor="standalone-label">作品标题</Label>
        <Input id="standalone-label" />
      </Specimen>
      <Specimen name="Field">
        <FieldSet>
          <FieldLegend>作品信息</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="field-demo">创作背景</FieldLabel>
              <Input id="field-demo" />
              <FieldDescription>
                说明文字保持独立、清晰的行距。
              </FieldDescription>
              <FieldError>请检查填写的内容。</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
      </Specimen>
      <Specimen name="FormField">
        <FormField
          id="form-field-demo"
          label="作品名称"
          description="最多 100 个字符。"
          required
          error="请填写作品名称。"
        >
          {(props) => <Input {...props} />}
        </FormField>
        <FormField id="form-field-disabled" label="不可编辑" disabled>
          {(props) => <Input {...props} defaultValue="已保存内容" />}
        </FormField>
      </Specimen>
      <Specimen name="RadioGroup">
        <RadioGroup
          aria-label="访问范围"
          value={scope}
          onValueChange={setScope}
        >
          {(["public", "members_only"] as const).map((value) => (
            <RadioOption
              key={value}
              value={value}
              id={`preview-${value}`}
              title={value === "public" ? "公开" : "仅成员可见"}
              description={
                value === "public"
                  ? "所有读者均可阅读。"
                  : "仅正常成员和管理员可以阅读。"
              }
            />
          ))}
        </RadioGroup>
        <RadioGroup aria-label="不可更改的范围" disabled defaultValue="public">
          <RadioGroupItem value="public" aria-label="不可更改" />
        </RadioGroup>
      </Specimen>
      <Specimen name="Card">
        <Card id="preview-card">
          <CardHeader>
            <CardTitle>作品纸页</CardTitle>
            <CardDescription>标题与正文通过细线和留白分区。</CardDescription>
            <CardAction>
              <IconButton variant="ghost" aria-label="纸页操作">
                <MoreHorizontal />
              </IconButton>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-body-lg leading-reading">
              作品正文保持安静的阅读空间。
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary">编辑</Button>
            <span className="text-label text-subtle">最后更新于今天</span>
          </CardFooter>
        </Card>
      </Specimen>
      <Specimen name="Surface">
        {(["default", "paper", "muted"] as const).map((variant) => (
          <div key={variant} className="space-y-4">
            {(["none", "sm", "md", "lg"] as const).map((padding) => (
              <Surface key={padding} variant={variant} padding={padding}>
                {variant} · {padding} · 承载层级
              </Surface>
            ))}
          </div>
        ))}
      </Specimen>
      <Specimen name="Alert">
        {(["default", "success", "warning", "danger"] as const).map(
          (variant) => (
            <Alert key={variant} variant={variant}>
              <AlertTitle>{variant} · 提示</AlertTitle>
              <AlertDescription>
                通过图标、侧线与文字表达状态。
              </AlertDescription>
            </Alert>
          ),
        )}
      </Specimen>
      <Specimen name="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">打开弹窗</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>补充创作背景</DialogTitle>
              <DialogDescription>
                独立纸页中的标题、正文与操作栏。
              </DialogDescription>
            </DialogHeader>
            <FormField id="dialog-context" label="背景说明">
              {(props) => <Textarea {...props} />}
            </FormField>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">取消</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>完成</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Specimen>
      <Specimen name="AlertDialog">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="danger">打开删除确认</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除这份草稿？</AlertDialogTitle>
              <AlertDialogDescription>
                测试样稿不会修改任何内容。这项操作需要明确确认。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>保留草稿</AlertDialogCancel>
              <AlertDialogAction variant="danger">确认删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Specimen>
      <Specimen name="Sheet">
        <div className="flex flex-wrap gap-3">
          {(["right", "left", "top", "bottom"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="secondary">打开目录 {side}</Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>诗刊目录</SheetTitle>
                  <SheetDescription>
                    展开的目录与正文保持清晰边界。
                  </SheetDescription>
                </SheetHeader>
                <div className="px-6 py-8">
                  <p className="font-serif text-body-lg">作品 · 特辑 · 关于</p>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button variant="secondary">收起目录</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </Specimen>
      <Specimen name="DropdownMenu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">打开操作菜单</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>作品操作</DropdownMenuLabel>
            <DropdownMenuItem>编辑作品</DropdownMenuItem>
            <DropdownMenuItem disabled>当前不可发布</DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
            >
              显示背景
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={scope} onValueChange={setScope}>
              <DropdownMenuRadioItem value="public">公开</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="members_only">
                仅成员可见
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>其他操作</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>查看记录</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">删除草稿</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Specimen>
      <Specimen name="Popover">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondary">查看消息</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0">
            <PopoverHeader>
              <PopoverTitle>最近消息</PopoverTitle>
              <PopoverDescription>消息标题与内容的层级。</PopoverDescription>
            </PopoverHeader>
            <p className="px-5 py-4 text-label">暂无新的消息。</p>
          </PopoverContent>
        </Popover>
      </Specimen>
      <Specimen name="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#preview-card" />
            </PaginationItem>
            {[1, 2, 3].map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href="#preview-card" isActive={page === 2}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#preview-card" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Specimen>
      <Specimen name="Separator">
        <p>普通分区</p>
        <Separator />
        <p>章节分区</p>
        <Separator decorative={false} />
      </Specimen>
      <Specimen name="Empty">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>还没有作品</EmptyTitle>
            <EmptyDescription>
              从一份草稿开始，写下仍然记得的事情。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="secondary">写一首诗</Button>
          </EmptyContent>
        </Empty>
      </Specimen>
      <Specimen name="Skeleton">
        <div aria-label="目录加载占位" className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </Specimen>
      <Specimen name="Spinner">
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-label text-subtle">正在读取作品</span>
        </div>
      </Specimen>
    </div>
  );
}
