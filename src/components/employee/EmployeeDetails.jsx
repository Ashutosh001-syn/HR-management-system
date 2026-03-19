import { EMPTY_VALUE, formatDate, getEmployeeName } from "@/utils/helpers";

function Section({ title, children }) {
  return (
    <div className="admin-form-section">
      <h6 className="mb-3">{title}</h6>
      <div className="row g-3">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="small text-muted">{label}</div>
      <div className="fw-semibold">{value || EMPTY_VALUE}</div>
    </div>
  );
}

export default function EmployeeDetails({ employee }) {
  const raw = employee?.raw || {};
  const fullName = getEmployeeName({
    first_name: raw.first_name,
    last_name: raw.last_name,
    name: employee?.name,
  });
  const photo = raw.photo || raw.profileimage || employee?.photo || employee?.profile_photo || "";

  return (
    <div>
      <div className="admin-profile-card">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center border"
              style={{ width: 64, height: 64, overflow: "hidden" }}
            >
              {photo ? (
                <img src={photo} alt={fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="fw-bold text-success">EMP</span>
              )}
            </div>

            <div className="flex-grow-1">
              <div className="h5 mb-1">{fullName}</div>
              <div className="text-muted small">
                {raw.designation || employee?.designation || EMPTY_VALUE} | {raw.department_name || employee?.department || EMPTY_VALUE}
              </div>
            </div>

            <div className="text-muted small">User ID: {employee?.id || EMPTY_VALUE}</div>
          </div>
      </div>

      <Section title="Primary Details">
        <Field label="First Name" value={raw.first_name} />
        <Field label="Last Name" value={raw.last_name} />
        <Field label="Gender" value={raw.gender} />
        <Field label="Date of Birth" value={formatDate(raw.dob)} />
        <Field label="Marital Status" value={raw.marital_status} />
        <Field label="Blood Group" value={raw.blood || raw.blood_group} />
      </Section>

      <Section title="Contact Details">
        <Field label="Work Email" value={raw.work_email || employee?.email} />
        <Field label="Personal Email" value={raw.personal_email} />
        <Field label="Contact No." value={raw.contact_no || employee?.phone} />
        <Field label="Emergency Contact Name" value={raw.emergency_contact_name} />
        <Field label="Relation With Them" value={raw.relation_with_them || raw.relation_with_emergency} />
        <Field label="Emergency Contact No." value={raw.emergency_contact_no} />
      </Section>

      <Section title="Employment Details">
        <Field label="Government UID" value={raw.govt_uid} />
        <Field label="Department" value={raw.department_name || employee?.department} />
        <Field label="Designation" value={raw.designation || employee?.designation} />
        <Field label="Office Time Policy" value={raw.office_time_policy} />
        <Field label="Date of Joining" value={formatDate(raw.date_of_joining)} />
        <Field label="Shift Start Date" value={formatDate(raw.shift_start_date)} />
        <Field label="Resignation Date" value={formatDate(raw.resignation_date)} />
        <Field label="Type" value={raw.type || "Employee"} />
      </Section>

      <Section title="Bank Details">
        <Field label="Bank Name" value={raw.bank_name} />
        <Field label="Bank A/C No." value={raw.bank_account_no} />
        <Field label="IFSC Code" value={raw.bank_ifsc_code} />
        <Field label="Nationality" value={raw.nationality} />
      </Section>

      <Section title="Account Details">
        <Field label="Password" value={raw.password} />
        <Field label="Profile Type" value={raw.profile_type} />
        <Field label="Profile Image" value={raw.profileimage} />
      </Section>
    </div>
  );
}
