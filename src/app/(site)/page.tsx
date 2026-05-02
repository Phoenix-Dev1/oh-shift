"use client";

import AuthForm from "./components/AuthForm";
import ThemeToggle from "./components/ThemeToggle";
import { Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Left Side: Authentication Form (40%) */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full lg:w-[40%] flex flex-col p-8 sm:p-12 lg:p-16 xl:p-24 justify-center relative z-10 bg-white dark:bg-slate-950 overflow-y-auto"
      >
        {/* Theme Switcher Placement */}
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5" fill="currentColor" />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
              Oh-Shift
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to your workspace
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm font-medium leading-relaxed">
            Manage your organization&apos;s shift scheduling with precision and security.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <AuthForm />
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-900"
        >
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3" />
            Secure Cloud Infrastructure
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side: Atmospheric Visual (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
        {/* Theme-Aware Background Swapping */}
        <Image
          src="/login-bg-light.png"
          alt="Tranquil landscape light"
          fill
          className="block dark:hidden object-cover opacity-90 scale-105"
          priority
        />
        <Image
          src="/login-bg.png"
          alt="Tranquil landscape dark"
          fill
          className="hidden dark:block object-cover opacity-90 scale-105"
          priority
        />
        
        {/* Theme-Aware Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-100/90 via-transparent to-slate-100/20 dark:from-slate-950/90 dark:via-transparent dark:to-slate-950/20" />
        <div className="absolute inset-0 bg-white/5 dark:bg-slate-950/10 backdrop-brightness-105 dark:backdrop-brightness-95" />

        {/* Muted Technical Indicators */}
        <div className="absolute bottom-0 left-0 w-full p-16 xl:p-24">
          <div className="grid grid-cols-3 gap-12 max-w-lg border-t border-slate-900/5 dark:border-white/5 pt-8">
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">99.9%</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Uptime SLA</p>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ISO/IEC</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Standardized</p>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">256-bit</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
