"use client";

import { Toaster } from "sonner";

const ToastProvider = () => {
  return (
    <Toaster 
      position="bottom-right" 
      richColors 
      expand={false}
      theme="system"
    />
  );
};

export default ToastProvider;
