import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 shrink-0 hover:-translate-y-0.5 active:translate-y-0",
  { variants: {
    variant: {
      default: "bg-primary text-white hover:bg-primary-dark shadow-sm",
      secondary: "bg-accent text-ink hover:bg-[#c5de42]",
      outline: "border border-line bg-transparent text-ink hover:bg-[#eee8f3]",
      ghost: "text-muted hover:bg-[#eee8f3] hover:text-ink",
    },
    size: {
      default: "h-11 px-5 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-12 px-6",
      icon: "h-10 w-10",
    },
  }, defaultVariants: { variant: "default", size: "default" } },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
