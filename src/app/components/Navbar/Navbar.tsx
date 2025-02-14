"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Sun,
  Moon,
  Home,
  LayoutDashboard,
  Send,
  Component,
} from "lucide-react";
import Image from "next/image";
import NavbarLinks from "./NavbarLinks";

const Navbar = () => {
  const [theme, setTheme] = useState<string>("light");
  const [isShrunk, setIsShrunk] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollY = useRef(0);

  // Toggle dark/light mode.
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      AOS.init({ once: true });

      // Check if screen size is mobile
      setIsMobile(window.innerWidth < 640);

      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        if (isMobile) {
          setIsShrunk(true);
          return;
        }
        const currentScrollY = window.scrollY;
        setIsShrunk(
          currentScrollY > lastScrollY.current && currentScrollY > 50
        );
        lastScrollY.current = currentScrollY;
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile]);

  // Define navbar style
  const navStyle = {
    maxWidth: isShrunk ? "600px" : "940px",
    width: "100%",
    backgroundColor: isMobile ? "transparent" : "var(--backdrop)",
    backdropFilter: isMobile ? "none" : isShrunk ? "blur(12px)" : "blur(6px)",
    outline: "0px",
  };

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full px-0 py-4 bg-transparent">
        <nav
          className="mx-auto flex items-center justify-between gap-6 rounded-full px-6 py-1 transition-all duration-300"
          style={navStyle}
          data-aos="fade-down"
          data-aos-easing="linear"
          data-aos-duration="1000"
        >
          {/* Brand / Logo */}
          <div className="flex bg-bg-600 h-[37px] justify-center items-center text-center dark:bg-slate-400 rounded-full">
            <Link href="/">
              <Image
                src="/bk-logo.png"
                alt="Bar Kaziro"
                width={40}
                height={40}
              />
            </Link>
          </div>
          {/* Navigation Links */}
          <NavbarLinks />

          {/* Dark/Light Mode Toggle */}
          <label className="swap swap-rotate">
            {/* this hidden checkbox controls the state */}
            <input type="checkbox" />

            {/* sun icon */}
            <svg
              onClick={toggleTheme}
              className="swap-on h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            {/* moon icon */}
            <svg
              onClick={toggleTheme}
              className="swap-off h-8 w-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
        </nav>
      </header>

      {/* Bottom Mobile Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 w-full sm:hidden">
        <ul className="flex w-full justify-evenly rounded-t-3xl border-t bg-background text-[var(--text-primary)] shadow backdrop-blur-md dark:border-gray-700">
          {[
            { href: "/", icon: <Home size={18} />, label: "Home" },
            { href: "/about", icon: <Component size={18} />, label: "About" },
            {
              href: "/projects",
              icon: <LayoutDashboard size={18} />,
              label: "Projects",
            },
            { href: "/contact", icon: <Send size={18} />, label: "Contact" },
          ].map(({ href, icon, label }) => (
            <li key={href} className="p-4">
              <Link
                href={href}
                className="flex flex-col items-center justify-center gap-1"
              >
                {icon}
                <span className="text-xs">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
