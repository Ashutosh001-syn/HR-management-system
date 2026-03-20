import { TOPBAR_HEIGHT, SIDEBAR_WIDTH } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";

export default function Topbar({
  sidebarCollapsed = false,
  sidebarWidth = SIDEBAR_WIDTH,
  onToggleSidebar,
}) {
  const navigate = useNavigate();

  const onSignOut = () => {
    localStorage.removeItem("userid");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <header
      className="admin-topbar d-flex align-items-center justify-content-between px-3"
      style={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        right: 0,
        height: TOPBAR_HEIGHT,
        zIndex: 1040,
        transition: "left 180ms ease",
      }}
    >
      <button
        type="button"
        className="btn admin-topbar__toggle"
        onClick={onToggleSidebar}
        aria-expanded={!sidebarCollapsed}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        Admin Panel
      </button>
      <button type="button" className="btn admin-topbar__logout" onClick={onSignOut}>
        Logout
      </button>
    </header>
  );
}
