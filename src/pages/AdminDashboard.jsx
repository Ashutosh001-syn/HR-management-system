import "@/pages/AdminTheme.css";
import Sidebar from "@/components/common/Sidebar";
import Topbar from "@/components/common/Topbar";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "@/utils/helpers";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="admin-shell min-vh-100">
      <Sidebar collapsed={sidebarCollapsed} />
      <main
        className="flex-grow-1"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: TOPBAR_HEIGHT,
          transition: "margin-left 180ms ease",
        }}
      >
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          sidebarWidth={sidebarWidth}
          onToggleSidebar={() => setSidebarCollapsed((currentValue) => !currentValue)}
        />
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
