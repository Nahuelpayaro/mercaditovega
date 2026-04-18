import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground shadow-[0_16px_30px_rgba(214,109,49,0.26)] hover:-translate-y-0.5 hover:bg-brand-strong active:translate-y-0",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_16px_30px_rgba(35,65,58,0.18)] hover:-translate-y-0.5 hover:bg-[#1a332d] active:translate-y-0",
        outline: "border border-border bg-white text-foreground shadow-[0_10px_24px_rgba(87,52,22,0.06)] hover:border-brand/25 hover:bg-background-muted",
        destructive: "bg-destructive text-white shadow-[0_16px_30px_rgba(194,58,43,0.22)] hover:bg-red-700 active:translate-y-0",
        ghost: "bg-transparent text-muted-foreground hover:bg-background-muted hover:text-foreground",
      },
      size: {
        default: "h-11",
        sm: "h-11 px-4 text-sm",
        lg: "h-13 px-6 text-base",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
