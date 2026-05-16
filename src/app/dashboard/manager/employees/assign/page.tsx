// src\app\dashboard\manager\employees\assign\page.tsx
"use client";

import React from "react";
import ConnectEmployeeUserPage from "../../components/ConnectEmployeeUserPage";

const ManagerDashboardPage: React.FC = () => {
  return (
    <div className="p-4">
      <ConnectEmployeeUserPage />
    </div>
  );
};

export default ManagerDashboardPage;
