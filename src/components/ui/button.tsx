import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-label font-medium transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
        default: "h-control px-4",
        sm: "h-control px-3 text-caption",
        lg: "h-12 px-6",
        icon: "h-control w-control",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type NativeButtonProps = React.ComponentProps<"button"> &
  ButtonVariantProps & {
    asChild?: false;
    loading?: boolean;
  };

type ChildButtonProps = Omit<React.ComponentProps<"button">, "disabled"> &
  ButtonVariantProps & {
    asChild: true;
    disabled?: never;
    loading?: never;
  };

export type ButtonProps = NativeButtonProps | ChildButtonProps;

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          data-loading-icon="true"
          className="animate-spin"
        />
      ) : null}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
