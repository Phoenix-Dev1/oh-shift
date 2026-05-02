"use client";

import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string;
  id: string;
  type?: string;
  value?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type,
  value,
  required,
  register,
  errors,
  disabled,
}) => {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={id}
        disabled={disabled}
        {...register(id, { required })}
        className={clsx(
          "block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-white text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
          errors[id] && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900"
        )}
      />
      {errors[id] && (
        <p className="text-xs text-red-500 font-medium">
          {label} is required
        </p>
      )}
    </div>
  );
};

export default Input;
