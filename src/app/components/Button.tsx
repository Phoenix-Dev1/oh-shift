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
        "flex items-center justify-center rounded-md font-semibold transition duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2",
        fullWidth && "w-full",
        secondary
          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
          : "text-white",
        danger ? "bg-red-500 hover:bg-red-600 focus-visible:ring-red-600" : "",
        !secondary && !danger
          ? "bg-blue-500 hover:bg-blue-600 focus-visible:ring-blue-600"
          : "",
        disabled && "opacity-50 cursor-not-allowed",
        size === "small" && "px-2 py-1 text-sm",
        size === "medium" && "px-4 py-2 text-base",
        size === "large" && "px-6 py-3 text-lg"
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin h-5 w-5" />
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
