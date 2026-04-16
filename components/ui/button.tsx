import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground shadow-[0_16px_30px_rgba(214,109,49,0.26)] hover:-translate-y-0.5 hover:bg-brand-strong",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_16px_30px_rgba(35,65,58,0.18)] hover:-translate-y-0.5 hover:opacity-95",
        outline: "border border-border bg-white/80 text-foreground hover:bg-background-muted",
        destructive: "bg-destructive text-white shadow-[0_16px_30px_rgba(194,58,43,0.22)] hover:bg-red-700",
        ghost: "bg-transparent text-muted-foreground hover:bg-white/80 hover:text-foreground",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-xs",
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
