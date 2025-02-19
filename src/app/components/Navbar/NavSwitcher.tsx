"use client";

import React from "react";
import MobileNavbar from "./MobileNavbar";
import Navbar from "./Navbar";
import useIsMobile from "../../hooks/useIsMobile";

const NavSwitcher = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileNavbar /> : <Navbar />;
};

export default NavSwitcher;
