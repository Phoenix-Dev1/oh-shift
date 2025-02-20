// src\app\dashboard\manager\employees\assign\page.tsx
"use client";

import React from "react";
import Sidebar from "../../components/Sidebar";
import ConnectEmployeeUserPage from "../../components/ConnectEmployeeUserPage";

const ManagerDashboardPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-bg-full text-text-primary">
      <Sidebar />
      <main className="flex-1 p-4">
        <ConnectEmployeeUserPage />
      </main>
    </div>
  );
};

export default ManagerDashboardPage;
