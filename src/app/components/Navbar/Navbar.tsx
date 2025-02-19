"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import NavbarLinks from "./NavbarLinks";

const Navbar = () => {
  const { data: session } = useSession();
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
    backgroundClor: isMobile ? "transparent" : "var(--backdrop)",
    backdropFilter: isMobile ? "none" : isShrunk ? "blur(12px)" : "blur(6px)",
    outline: "0px",
  };

  return (
    <>
      {session ? (
        <header className="sticky top-0 z-50 w-full px-0 py-4 bg-transparent">
          <nav
            className="mx-auto flex items-center justify-between gap-6 rounded-full px-6 py-1 transition-all duration-300"
            style={navStyle}
            data-aos="fade-down"
            data-aos-easing="linear"
            data-aos-duration="1000"
          >
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
            <NavbarLinks />
            <button
              aria-label="Toggle Theme"
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full border p-2 transition-all active:scale-90 dark:border-gray-700"
            >
              {theme === "light" ? (
                <Sun size={18} className="text-[var(--text-primary)]" />
              ) : (
                <Moon size={18} className="text-[var(--text-primary)]" />
              )}
            </button>
          </nav>
        </header>
      ) : null}
    </>
  );
};

export default Navbar;
