"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
  size = "medium",
  loading = false,
  iconLeft,
  iconRight,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2",
        fullWidth && "w-full",
        secondary
          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
          : !danger && "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-500/20",
        danger && "bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-500/20",
        disabled && "opacity-50 cursor-not-allowed grayscale",
        size === "small" && "px-3 py-1.5 text-xs",
        size === "medium" && "px-4 py-2 text-sm",
        size === "large" && "px-6 py-3 text-base"
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
          {iconRight && <span className="ml-2">{iconRight}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
