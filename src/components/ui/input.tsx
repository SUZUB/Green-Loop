import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#1E293B] placeholder:text-[#94A3B8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{ borderColor: "#D1FAE5", ...style }}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
