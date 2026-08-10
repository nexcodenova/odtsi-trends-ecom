import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "action" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  action: "bg-action text-action-ink hover:brightness-95",
  ghost: "bg-transparent text-primary hover:bg-primary-light",
};

export function Button({ variant = "action", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
