import EditEmployeeForm from "@/components/employee/EditEmployeeForm";

export default function EditEmployeeModal({ show, onClose, employee, onSaved }) {
  if (!show || !employee) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show" style={{ display: "block" }} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Employee</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
              <EditEmployeeForm
                employee={employee}
                onCancel={onClose}
                onSaved={(savedEmployee, response) => {
                  onSaved?.(savedEmployee, response);
                  onClose?.();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
