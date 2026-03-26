import { deleteUser } from "@/api/adminApi";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Error from "@/components/common/Error";
import Loader from "@/components/common/Loader";
import NotificationModal from "@/components/common/NotificationModal";
import EditEmployeeModal from "@/components/employee/EditEmployeeModal";
import EmployeeDetails from "@/components/employee/EmployeeDetails";
import useEmployees from "@/hooks/useEmployees";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Employees() {
  const navigate = useNavigate();
  const {
    employees,
    setEmployees,
    loading,
    error,
    fetchEmployees,
    fetchEmployeeById,
  } = useEmployees();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [confirmation, setConfirmation] = useState({ show: false, message: "", onConfirm: null });


  const filteredEmployees = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const id = String(employee.id || "").toLowerCase();
      const name = String(employee.name || "").toLowerCase();
      const department = String(employee.department || "").toLowerCase();
      const designation = String(employee.designation || "").toLowerCase();
      return id.includes(query) || name.includes(query) || department.includes(query) || designation.includes(query);
    });
  }, [employees, searchTerm]);

  const openEmployee = async (employee) => {
    try {
      const detailedEmployee = await fetchEmployeeById(employee.id);
      setSelectedEmployee(detailedEmployee || employee);
    } catch {
      setSelectedEmployee(employee);
    }
  };

  const openEditEmployee = async (employee) => {
    try {
      const detailedEmployee = await fetchEmployeeById(employee.id);
      setEmployeeToEdit(detailedEmployee || employee);
    } catch {
      setEmployeeToEdit(employee);
    } finally {
      setShowEditModal(true);
    }
  };

  const handleDeleteEmployee = (employee) => {
    setConfirmation({
      show: true,
      message: `Delete employee ${employee.name} (User ID: ${employee.id})? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const userId = employee?.raw?.userid || employee?.raw?.user_id || employee?.id;
          await deleteUser(userId);
          setEmployees((current) => current.filter((item) => item.id !== employee.id));
          if (selectedEmployee?.id === employee.id) {
            setSelectedEmployee(null);
          }
          setNotification({ show: true, message: "Employee deleted successfully.", type: "success" });
        } catch (err) {
          setNotification({ show: true, message: err.message || "Failed to delete employee.", type: "error" });
        }
      },
    });
  };

  return (
    <>
      <div className="admin-page">
        <section className="admin-page__hero">
          <div>
            <div className="admin-page__eyebrow">People Operations</div>
            <h1 className="admin-page__title">{selectedEmployee ? "Employee details and profile view" : "Employee directory and actions"}</h1>
            <p className="admin-page__text">
              {selectedEmployee
                ? "Review full employee information and move into editing without losing context."
                : "Search, inspect, update, and manage the workforce from a single dashboard-style workspace."}
            </p>
            {!selectedEmployee && (
              <div className="admin-page__meta">
                <span>{employees.length} total employees</span>
                <span>{filteredEmployees.length} visible records</span>
              </div>
            )}
          </div>

          <div className="admin-page__actions">
            {!selectedEmployee ? (
              <>
                <button className="btn btn-outline-light" type="button" onClick={() => fetchEmployees()} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
                <button className="btn btn-light" type="button" onClick={() => navigate("/dashboard/employees/new")}>
                  Add Employee
                </button>
              </>
            ) : (
              <button className="btn btn-light" type="button" onClick={() => setSelectedEmployee(null)}>
                Back to List
              </button>
            )}
          </div>
        </section>

        {!selectedEmployee && (
          <div className="admin-surface">
            <div className="admin-toolbar">
              <div>
                <div className="admin-section-kicker">Directory</div>
                <h5 className="admin-section-title">Employees</h5>
              </div>
              <div className="admin-toolbar__group">
                <input
                  type="text"
                  className="form-control admin-search"
                  style={{ minWidth: 240 }}
                  placeholder="Search by user ID, name, dept, role"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            {error && <Error message={error} />}
            {loading && <Loader label="Loading employees..." />}
            {!loading && !error && filteredEmployees.length === 0 && (
              <div className="admin-empty-state">No employees found.</div>
            )}
            {!loading && !error && filteredEmployees.length > 0 && (
              <div className="table-responsive">
                <table className="table admin-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>User ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td>{employee.name}</td>
                        <td>{employee.department}</td>
                        <td>{employee.designation}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => openEmployee(employee)}>
                              View
                            </button>
                            <button className="btn btn-sm btn-warning" onClick={() => openEditEmployee(employee)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => navigate(`/dashboard/reports/${employee.id}`)}
                            >
                              Report
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEmployee(employee)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedEmployee && (
          <div className="admin-surface">
            <EmployeeDetails employee={selectedEmployee} />
            <div className="admin-form-actions mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setSelectedEmployee(null)}>
                Back
              </button>
              <button className="btn btn-warning" onClick={() => openEditEmployee(selectedEmployee)}>
                Edit Employee
              </button>
            </div>
          </div>
        )}
      </div>

      <EditEmployeeModal
        show={showEditModal}
        employee={employeeToEdit}
        onClose={() => {
          setShowEditModal(false);
          setEmployeeToEdit(null);
        }}
        onSaved={(savedEmployee) => {
          setEmployees((current) => current.map((item) => (item.id === savedEmployee.id ? savedEmployee : item)));
          if (selectedEmployee?.id === savedEmployee.id) {
            setSelectedEmployee(savedEmployee);
          }
          setNotification({ show: true, message: "Employee updated successfully.", type: "success" });
        }}
      />

      <NotificationModal
        show={notification.show}
        onClose={() => setNotification((current) => ({ ...current, show: false }))}
        message={notification.message}
        type={notification.type}
      />

      <ConfirmationModal
        show={confirmation.show}
        onClose={() => setConfirmation((current) => ({ ...current, show: false }))}
        onConfirm={confirmation.onConfirm}
        message={confirmation.message}
      />
    </>
  );
}
