import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Button，变体与尺寸按 `docs/design-system.md` 的语义 Token 定制。
 * 保留 shadcn 的 `data-slot` / `asChild`（Radix Slot）约定，
 * 同时保留本项目的 `loading` 语义：aria-busy + 禁止重复提交。
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground",
        danger:
          "bg-danger text-danger-foreground hover:bg-danger-hover active:bg-danger-hover",
      },
      size: {
        default: "h-control px-4 text-label",
        sm: "h-control px-3 text-caption",
        lg: "h-12 px-6 text-label",
        icon: "h-control w-control text-label",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

type NativeButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    asChild?: false;
    loading?: boolean;
  };

type ChildButtonProps = Omit<React.ComponentProps<"button">, "disabled"> &
  ButtonVariants & {
    asChild: true;
    disabled?: never;
    loading?: never;
  };

export type ButtonProps = NativeButtonProps | ChildButtonProps;

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner
          role={undefined}
          aria-label={undefined}
          aria-hidden="true"
          data-loading-icon="true"
        />
      ) : null}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
