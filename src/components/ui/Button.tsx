"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-[var(--brand-primary)] text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] border border-transparent",
      secondary: "bg-[var(--brand-secondary)] text-white font-bold shadow-[0_0_15px_rgba(188,19,254,0.4)] hover:shadow-[0_0_25px_rgba(188,19,254,0.6)] border border-transparent",
      outline: "bg-transparent border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[rgba(0,243,255,0.1)]",
      ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
