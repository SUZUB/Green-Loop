import type { ComponentProps } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

/** Avoid `next-themes` here: there is no `ThemeProvider` at the app root, which can break first paint. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-[#1E293B] group-[.toaster]:border-[#D1FAE5] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#475569]",
          actionButton: "group-[.toast]:bg-[#10B981] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-[#475569]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
