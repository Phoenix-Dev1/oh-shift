"use client";

import React, { useState, useEffect } from "react";
import MobileNavbar from "./MobileNavbar";
import Navbar from "./Navbar";
import useIsMobile from "../../hooks/useIsMobile";

const NavSwitcher = () => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by not rendering responsive-dependent components
  // until the component has mounted on the client.
  if (!mounted) {
    return <Navbar />; // Default to desktop view for SSR
  }

  return isMobile ? <MobileNavbar /> : <Navbar />;
};

export default NavSwitcher;
