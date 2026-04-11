import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Vibrant Mint CTA — bright but professional */
        default:     "bg-[#34D399] text-[#1E293B] hover:bg-[#A7F3D0] shadow-sm hover:shadow-md",
        /* Destructive */
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        /* Outlined — Deep Sage border */
        outline:     "border-2 border-[#10B981] bg-transparent text-[#14532D] hover:bg-[#DCFCE7]",
        /* Soft secondary */
        secondary:   "bg-[#F0FDF4] text-[#14532D] border border-[#D1FAE5] hover:bg-[#DCFCE7]",
        /* Ghost */
        ghost:       "text-[#475569] hover:bg-[#F0FDF4] hover:text-[#14532D]",
        /* Link */
        link:        "text-[#10B981] underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-4 text-xs",
        lg:      "h-12 px-8 text-base",
        icon:    "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
