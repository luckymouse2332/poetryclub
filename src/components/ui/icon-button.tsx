import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";

export type IconButtonProps = ButtonProps & {
  "aria-label": string;
};

function IconButton({
  size = "icon",
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      size={size}
      className={cn(
        "shrink-0 aria-busy:[&>svg:not([data-loading-icon])]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { IconButton };
