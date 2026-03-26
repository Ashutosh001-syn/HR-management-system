import Loader from "@/components/common/Loader";
import ScrollToTop from "@/components/common/ScrollToTop";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Employees = lazy(() => import("@/pages/Employees"));
const Leaves = lazy(() => import("@/pages/Leaves"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const WifiSystem = lazy(() => import("@/pages/WifiSystem"));
const NoticeBoard = lazy(() => import("@/pages/NoticeBoard"));
const EmployeeFormPage = lazy(() => import("@/pages/EmployeeFormPage"));
const PlaceholderPage = lazy(() => import("@/pages/PlaceholderPage"));
const Payslip = lazy(() => import("@/pages/Payslip"));
const Reports = lazy(() => import("@/pages/Reports"));

function ProtectedRoute({ children }) {
  const userid = localStorage.getItem("userid");
  return userid ? children : <Navigate to="/" replace />;
}

function RouteFallback() {
  return <Loader label="Loading page..." />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/AdminDashboard" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="wifi-system" element={<WifiSystem />} />
          <Route path="notice" element={<NoticeBoard />} />
          <Route path="payslip" element={<Payslip />} />
          <Route path="reports/:userId?" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
