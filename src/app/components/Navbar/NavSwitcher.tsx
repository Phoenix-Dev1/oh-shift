"use client";

import React, { useState, useEffect } from "react";
import MobileNavbar from "./MobileNavbar";
import Navbar from "./Navbar";
import useIsMobile from "../../hooks/useIsMobile";
import { usePathname } from "next/navigation";

const NavSwitcher = () => {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide navbar completely on the login/home page
  if (pathname === "/") {
    return null;
  }

  // Avoid hydration mismatch by not rendering responsive-dependent components
  // until the component has mounted on the client.
  if (!mounted) {
    return null; // Return nothing until mounted — prevents flash
  }

  return isMobile ? <MobileNavbar /> : <Navbar />;
};

export default NavSwitcher;
