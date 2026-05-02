"use client";

import React, { useState, useEffect } from "react";
import { Linkedin, Github, Instagram, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";

const SocialLink = ({ href, icon, label, index }: { href: string; icon: React.ReactNode; label: string; index: number }) => {
  const brandThemes: Record<string, string> = {
    LinkedIn: "text-[#0077B5] bg-[#0077B5]/5 border-[#0077B5]/10 hover:bg-[#0077B5]/15 hover:border-[#0077B5]/30",
    GitHub: "text-slate-900 dark:text-white bg-slate-900/5 dark:bg-white/5 border-slate-900/10 dark:border-white/10 hover:bg-slate-900/15 dark:hover:bg-white/15 hover:border-slate-900/30 dark:hover:border-white/30",
    Instagram: "text-[#E4405F] bg-[#E4405F]/5 border-[#E4405F]/10 hover:bg-[#E4405F]/15 hover:border-[#E4405F]/30",
    "Email Me": "text-[#EA4335] bg-[#EA4335]/5 border-[#EA4335]/10 hover:bg-[#EA4335]/15 hover:border-[#EA4335]/30",
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`group relative p-3.5 rounded-2xl border flex items-center justify-center transition-all duration-300 ${brandThemes[label] || "text-indigo-500 bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/15"}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.4,
        }}
        className="relative z-10 transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110"
      >
        {icon}
      </motion.div>

      <div className="absolute inset-0 rounded-2xl bg-current opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300" />

      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 group-hover:-top-14 transition-all duration-300 pointer-events-none">
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-black py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md uppercase tracking-[0.15em] whitespace-nowrap">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-200 dark:border-t-slate-800" />
        </div>
      </div>

      <motion.div
        animate={{
          opacity: [0.2, 0.7, 0.2],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.5
        }}
        className="absolute inset-0 rounded-2xl blur-2xl bg-current -z-10 group-hover:opacity-100 group-hover:blur-3xl transition-all duration-500"
      />
    </motion.a>
  );
};

const HeartExplosion = () => {
  return (
    <span className="relative group/heart flex items-center justify-center mx-1">
      <Heart
        size={14}
        className="text-red-500 fill-red-500/20 animate-pulse group-hover/heart:scale-125 transition-transform duration-300"
      />

      <span className="absolute inset-0 pointer-events-none opacity-0 group-hover/heart:opacity-100 transition-opacity duration-300">
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: -25 - (i * 8),
              x: (i === 1 ? -12 : i === 2 ? 0 : 12),
              scale: [0.5, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
            className="absolute text-red-400"
          >
            <Heart size={8} fill="currentColor" />
          </motion.span>
        ))}
      </span>
    </span>
  );
};

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  const handleScramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        text.split("").map((char, index) => {
          if (index < iteration) return text[index];
          if (char === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span
      onMouseEnter={handleScramble}
      className="cursor-default transition-colors hover:text-indigo-500"
    >
      {displayText}
    </span>
  );
};

const CopyrightSymbol = () => {
  return (
    <motion.span
      animate={{ 
        rotate: [0, 5, -5, 0],
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      whileHover={{ 
        rotate: 360, 
        scale: 1.4,
        color: "#6366f1",
        opacity: 1
      }}
      className="inline-block cursor-pointer opacity-60 px-0.5 transition-colors duration-300"
    >
      ©
    </motion.span>
  );
};

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-8" />;
  }

  return (
    <>
      {/* Desktop Footer (screens ≥640px) */}
      <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-8 text-slate-900 dark:text-white hidden sm:block">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="flex items-center gap-1">
                <CopyrightSymbol />
                <span className="opacity-60">{currentYear || '2024'}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400 opacity-30 mx-1"></span>
              <span>Made with</span>
              <HeartExplosion />
              <span>by</span>
              <span className="text-slate-900 dark:text-white font-bold tracking-tight hover:text-indigo-500 transition-colors duration-300">
                Bar Kaziro
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">
              <ScrambleText text="All Rights Reserved" />
            </p>
          </div>

          <div className="flex items-center gap-5">
            <SocialLink index={0} href="https://www.linkedin.com/in/bar-kaziro" icon={<Linkedin size={18} />} label="LinkedIn" />
            <SocialLink index={1} href="https://github.com/Phoenix-Dev1" icon={<Github size={18} />} label="GitHub" />
            <SocialLink index={2} href="https://www.instagram.com/barkaziro" icon={<Instagram size={18} />} label="Instagram" />
            <SocialLink index={3} href="mailto:barkaziro@gmail.com" icon={<Mail size={18} />} label="Email Me" />
          </div>
        </div>
      </footer>

      {/* Mobile Footer (screens <640px) */}
      <footer className="w-full bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-8 text-slate-900 dark:text-white block sm:hidden">
        <div className="mx-auto flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="flex items-center gap-1">
                <CopyrightSymbol />
                <span className="opacity-60">{currentYear || '2024'}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400 opacity-30 mx-0.5"></span>
              <span>Made with</span>
              <HeartExplosion />
              <span>by</span>
              <span className="text-slate-900 dark:text-white font-bold hover:text-indigo-500 transition-colors">
                Bar Kaziro
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-bold">
              <ScrambleText text="All Rights Reserved" />
            </p>
          </div>

          <div className="flex items-center gap-6">
            <SocialLink index={0} href="https://www.linkedin.com/in/bar-kaziro" icon={<Linkedin size={20} />} label="LinkedIn" />
            <SocialLink index={1} href="https://github.com/Phoenix-Dev1" icon={<Github size={20} />} label="GitHub" />
            <SocialLink index={2} href="https://www.instagram.com/barkaziro" icon={<Instagram size={20} />} label="Instagram" />
            <SocialLink index={3} href="mailto:barkaziro@gmail.com" icon={<Mail size={20} />} label="Email Me" />
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
