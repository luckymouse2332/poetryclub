/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

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
        "shrink-0 px-0 tracking-normal hover:bg-accent hover:no-underline aria-busy:[&>svg:not([data-loading-icon])]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export { IconButton };
