"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const [showButton, setShowButton] = useState(false);

  // Show the button when the user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to the top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleScrollToTop}
      className={`fixed bottom-[84px] right-4 z-50 flex items-center justify-center dark:text-white rounded-full border border-gray-500 p-3 shadow backdrop-blur-md transition-all active:scale-90 sm:bottom-4 ${
        showButton
          ? "bg-backdrop hover:bg-bg-700 visible"
          : "invisible opacity-0"
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} strokeWidth={2} />
    </button>
  );
};

export default ScrollToTop;
