import NotificationModal from "@/components/common/NotificationModal";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

  return (
    <>
      <div className="admin-page">
        <section className="admin-page__hero">
          <div>
            <div className="admin-page__eyebrow">People Onboarding</div>
            <h1 className="admin-page__title">Create a new employee profile</h1>
            <p className="admin-page__text">Fill in employee information inside the same dashboard-inspired workspace used across the admin area.</p>
          </div>
          <div className="admin-page__actions">
            <button className="btn btn-light" type="button" onClick={() => navigate("/dashboard/employees")}>
              Back to Employees
            </button>
          </div>
        </section>

        <div className="admin-surface">
          <EmployeeForm
            onSaved={(employee) => {
              setNotification({
                show: true,
                message: `Employee created successfully. User ID: ${employee.id}`,
                type: "success",
              });
            }}
          />
          <div className="admin-form-actions mt-3">
            <button className="btn btn-outline-secondary" type="button" onClick={() => navigate("/dashboard/employees")}>
              Back to Employees
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        show={notification.show}
        onClose={() => setNotification((current) => ({ ...current, show: false }))}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
}
