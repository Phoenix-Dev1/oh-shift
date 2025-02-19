"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import NavbarLinks from "./NavbarLinks";

const MobileNavbar = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");

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

  return (
    <>
      {session ? (
        <header className="sticky top-0 z-50 w-full bg-transparent text-text-secondary">
          <nav className="flex items-center justify-between p-4 bg-bg-800 dark:bg-bg-900 ">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-md focus:outline-none"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link href="/">
                <Image src="/bk-logo.png" alt="Logo" width={40} height={40} />
              </Link>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border dark:border-gray-700"
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
          {menuOpen && (
            <div className="bg-bg-600 dark:bg-bg-700 p-4">
              <ul className="flex flex-col gap-4 text-base">
                {/*
              You can either reuse your NavbarLinks component (if it works well in mobile)
              or write out the links manually.
            */}
                <li>
                  <Link href="/" onClick={() => setMenuOpen(false)}>
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                {session && (
                  <li className="hover:text-red-400">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                      }}
                    >
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </header>
      ) : null}
    </>
  );
};

export default MobileNavbar;
