import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-[1rem] text-sm font-bold uppercase tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand-green-light)] text-[#1e4620] shadow-[0_10px_20px_rgba(0,0,0,0.1),0_4px_0_#93d635] hover:bg-[#bdf05d] hover:translate-y-[1px] hover:shadow-[0_8px_15px_rgba(0,0,0,0.1),0_3px_0_#93d635] active:translate-y-[4px] active:shadow-none",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/50 hover:shadow-xl hover:shadow-destructive/60 hover:scale-105 active:scale-100",
        outline:
          "border-2 border-[#b4e655]/30 bg-transparent text-[#1e4620] hover:bg-[#b4e655]/10 hover:border-[#b4e655]/50 hover:scale-105 active:scale-100",
        secondary:
          "bg-[#1e4620] text-white shadow-md hover:bg-[#2a5d2d] hover:shadow-lg hover:scale-105 active:scale-100",
        ghost: "hover:bg-[#b4e655]/10 hover:text-[#1e4620] hover:scale-105 active:scale-100",
        link: "text-[#1e4620] underline-offset-4 hover:underline normal-case tracking-normal",
        gradient:
          "bg-gradient-to-r from-[#b4e655] via-[#c5f075] to-[#b4e655] text-[#1e4620] shadow-lg hover:shadow-xl hover:scale-105 active:scale-100",
      },
      size: {
        default: "h-[4.5rem] px-12 py-4 text-xl",
        sm: "h-10 rounded-xl px-5 text-xs",
        lg: "h-20 rounded-[2.5rem] px-14 text-2xl",
        icon: "h-16 w-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
