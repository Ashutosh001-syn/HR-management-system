import { TOPBAR_HEIGHT, SIDEBAR_WIDTH } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
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
        left: SIDEBAR_WIDTH,
        right: 0,
        height: TOPBAR_HEIGHT,
        zIndex: 1040,
      }}
    >
      <div className="admin-topbar__label">Admin Panel</div>
      <button type="button" className="btn admin-topbar__logout" onClick={onSignOut}>
        Logout
      </button>
    </header>
  );
}
