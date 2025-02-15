// app/components/Footer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Linkedin, Github, Instagram, Mail } from "lucide-react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full bg-bg-900 dark:bg-bg-800 px-4 py-6 text-[var(--text-primary)] mt-auto">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-center text-sm sm:text-left">
          © {currentYear} Made with ♥ by Bar Kaziro.
        </p>
        <div className="flex items-center gap-6">
          <a
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/bar-kaziro/"
          >
            <Linkedin size={20} />
          </a>
          <a
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Phoenix-Dev1"
          >
            <Github size={20} />
          </a>
          <a
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/barkaziro/"
          >
            <Instagram size={20} />
          </a>
          <a
            aria-label="Gmail"
            target="_blank"
            rel="noopener noreferrer"
            href="mailto:barkaziro@gmail.com"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
