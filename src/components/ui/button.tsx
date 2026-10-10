import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a63146] focus-visible:ring-offset-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 shrink-0",
  { variants: {
    variant: {
      default: "bg-[#a63146] text-white hover:bg-[#872338] shadow-sm",
      secondary: "bg-[#202221] text-white hover:bg-[#383b37]",
      outline: "border border-[#d9ddd6] bg-transparent text-[#202221] hover:bg-[#f0f1ed]",
      ghost: "text-[#555a54] hover:bg-[#f0f1ed] hover:text-[#202221]",
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
