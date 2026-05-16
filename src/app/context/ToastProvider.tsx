"use client";

import { Toaster } from "sonner";
import { useTheme } from "./ThemeContext";

const ToastProvider = () => {
  const { theme } = useTheme();

  return (
    <Toaster 
      position="bottom-right" 
      richColors 
      expand={false}
      theme={theme || "light"}
      toastOptions={{
        className: "border border-slate-200 dark:border-slate-800 shadow-lg font-sans",
      }}
    />
  );
};

export default ToastProvider;
