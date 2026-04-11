import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        /* Default — Emerald Mint */
        default:     "bg-[#10B981] text-white",
        /* Verified — Pale Lime + Olive Green */
        secondary:   "bg-[#ECFCCB] text-[#3F6212] border border-[#BEF264]",
        destructive: "bg-red-100 text-red-700 border border-red-200",
        outline:     "bg-transparent text-[#475569] border border-[#D1FAE5]",
        success:     "bg-[#DCFCE7] text-[#065F46] border border-[#A7F3D0]",
        warning:     "bg-amber-100 text-amber-700 border border-amber-200",
        info:        "bg-sky-100 text-sky-700 border border-sky-200",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
