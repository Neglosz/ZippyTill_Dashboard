import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto pl-6 pt-4 pr-6 bg-[#F9FAFB]"
          style={{ scrollbarGutter: "stable" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
