import CollapsedLogo from "@/assets/Inmortal 1.png";
import FullLogo from "@/assets/Inmortallogo.png";
import "./Sidebar.css";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "@/utils/helpers";
import {
  FiActivity,
  FiBell,
  FiCalendar,
  FiFileText,
  FiGrid,
  FiUserPlus,
  FiUsers,
  FiWifi,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { key: "employees", label: "Employees", to: "/dashboard/employees", icon: FiUsers },
  { key: "employee-create", label: "Employee Creation", to: "/dashboard/employees/new", icon: FiUserPlus },
  { key: "leaves", label: "Leave Approval", to: "/dashboard/leaves", icon: FiCalendar },
  { key: "attendance", label: "Attendance", to: "/dashboard/attendance", icon: FiActivity },
  { key: "wifi-system", label: "Wifi System", to: "/dashboard/wifi-system", icon: FiWifi },
  { key: "notice", label: "Notice", to: "/dashboard/notice", icon: FiBell },
  { key: "payslip", label: "Payslip", to: "/dashboard/payslip", icon: FiFileText },
];

function isActivePath(pathname, item) {
  if (item.to === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname.startsWith(item.to);
}

export default function Sidebar({ collapsed = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`dashboard-sidebar d-flex flex-column ${collapsed ? "is-collapsed" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: "100vh",
        overflowY: "auto",
        zIndex: 1030,
      }}
    >
      <div className="dashboard-sidebar__glow dashboard-sidebar__glow--top" />
      <div className="dashboard-sidebar__glow dashboard-sidebar__glow--bottom" />

      <div className="dashboard-sidebar__brand">
        {/* <div className="dashboard-sidebar__chip">HR Workspace</div> */}
        <img
          src={collapsed ? CollapsedLogo : FullLogo}
          alt="Company logo"
          className="dashboard-sidebar__logo"
        />
        {/* <p className="dashboard-sidebar__subtitle">Smart navigation for attendance, wifi, notices, and people ops.</p> */}
      </div>

      <div className="dashboard-sidebar__divider" />

      <nav className="dashboard-sidebar__nav" role="tablist" aria-orientation="vertical">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(location.pathname, item);
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              className={`dashboard-sidebar__link ${active ? "is-active" : ""}`}
              onClick={() => navigate(item.to)}
              aria-label={item.label}
              title={item.label}
            >
              <span className="dashboard-sidebar__icon">
                <Icon size={18} />
              </span>
              <span className="dashboard-sidebar__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
