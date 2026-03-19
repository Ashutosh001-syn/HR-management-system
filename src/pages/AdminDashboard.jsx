import "@/pages/AdminTheme.css";
import Sidebar from "@/components/common/Sidebar";
import Topbar from "@/components/common/Topbar";
import { SIDEBAR_WIDTH, TOPBAR_HEIGHT } from "@/utils/helpers";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="admin-shell min-vh-100">
      <Sidebar />
      <main className="flex-grow-1" style={{ marginLeft: SIDEBAR_WIDTH, paddingTop: TOPBAR_HEIGHT }}>
        <Topbar />
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
