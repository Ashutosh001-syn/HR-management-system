import { editUser } from "@/api/adminApi";
import { formatDate, getUserIdentifierDetails, normalizeEmployee, RELATION_OPTIONS } from "@/utils/helpers";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_EDIT_FORM = {
  first_name: "",
  last_name: "",
  gender: "",
  dob: "",
  marital_status: "",
  blood_group: "",
  work_email: "",
  personal_email: "",
  contact_no: "",
  emergency_contact_name: "",
  relation_with_them: "",
  emergency_contact_no: "",
  bank_name: "",
  bank_account_no: "",
  bank_ifsc_code: "",
  nationality: "",
  password: "",
  profile_type: "",
  profileimage: "",
  type: "Employee",
  govt_uid: "",
  department_name: "",
  designation: "",
  office_time_policy: "",
  date_of_joining: "",
  shift_start_date: "",
  resignation_date: "",
  user_id: "",
  userid: "",
  userId: "",
};

function getInitialEditForm(employee) {
  if (!employee) {
    return { ...DEFAULT_EDIT_FORM };
  }

  const raw = employee.raw || {};
  const { value, numericValue } = getUserIdentifierDetails(employee);
  const resolvedUserId = raw.user_id || raw.userid || raw.userId || numericValue || value || "";

  return {
    first_name: raw.first_name || employee.name?.split(" ")?.[0] || "",
    last_name: raw.last_name || employee.name?.split(" ").slice(1).join(" ") || "",
    gender: raw.gender || "",
    dob: raw.dob ? formatDate(raw.dob) : "",
    marital_status: raw.marital_status || "",
    blood_group: raw.blood_group || raw.blood || "",
    work_email: raw.work_email || employee.email || "",
    personal_email: raw.personal_email || "",
    contact_no: raw.contact_no || employee.phone || "",
    emergency_contact_name: raw.emergency_contact_name || "",
    relation_with_them: raw.relation_with_them || raw.relation_with_emergency || "",
    emergency_contact_no: raw.emergency_contact_no || "",
    bank_name: raw.bank_name || "",
    bank_account_no: raw.bank_account_no || "",
    bank_ifsc_code: raw.bank_ifsc_code || "",
    nationality: raw.nationality || "",
    password: raw.password || "",
    profile_type: raw.profile_type || "",
    profileimage: raw.profileimage || "",
    type: raw.type || "Employee",
    govt_uid: raw.govt_uid || "",
    department_name: raw.department_name || employee.department || "",
    designation: raw.designation || employee.designation || "",
    office_time_policy: raw.office_time_policy || "",
    date_of_joining: raw.date_of_joining ? formatDate(raw.date_of_joining) : "",
    shift_start_date: raw.shift_start_date ? formatDate(raw.shift_start_date) : "",
    resignation_date: raw.resignation_date ? formatDate(raw.resignation_date) : "",
    user_id: String(resolvedUserId),
    userid: String(resolvedUserId),
    userId: String(resolvedUserId),
  };
}

function Field({ label, name, value, onChange, type = "text", required = false, readOnly = false }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className="form-control"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="form-select"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border rounded-3 p-3 mb-3 bg-white shadow-sm">
      <h6 className="mb-3">{title}</h6>
      <div className="row g-3">{children}</div>
    </div>
  );
}

export default function EditEmployeeForm({ employee, onSaved, onCancel }) {
  const initialForm = useMemo(() => getInitialEditForm(employee), [employee]);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const relationOptions = useMemo(() => {
    const currentRelation = formData.relation_with_them?.trim();
    if (currentRelation && !RELATION_OPTIONS.includes(currentRelation)) {
      return [currentRelation, ...RELATION_OPTIONS];
    }

    return RELATION_OPTIONS;
  }, [formData.relation_with_them]);

  useEffect(() => {
    setFormData(initialForm);
    setSubmitError("");
  }, [initialForm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nameOnlyFields = ["first_name", "last_name", "emergency_contact_name"];
    const isNameOnlyField = nameOnlyFields.includes(name);

    if (isNameOnlyField && value && !/^[A-Za-z\s]*$/.test(value)) {
      return;
    }

    setFormData((current) => {
      if (name === "user_id" || name === "userid" || name === "userId") {
        return {
          ...current,
          user_id: value,
          userid: value,
          userId: value,
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const resolvedUserId = String(formData.user_id || formData.userid || formData.userId || "").trim();

      if (!resolvedUserId) {
        setSubmitError("User ID is required.");
        setSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        user_id: resolvedUserId,
        userid: resolvedUserId,
        userId: resolvedUserId,
      };

      const response = await editUser(payload, resolvedUserId);
      const normalized = normalizeEmployee({
        ...employee?.raw,
        ...payload,
        ...response,
        id: response?.userid || response?.user_id || response?.userId || employee?.id || response?.id,
        user_id: resolvedUserId,
        userid: resolvedUserId,
        userId: resolvedUserId,
      });

      onSaved?.(normalized, response);
    } catch (err) {
      setSubmitError(err.message || "Failed to update employee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {submitError && <div className="alert alert-danger">{submitError}</div>}

      <Section title="Primary Details">
        <Field label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
        <Field label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
        <SelectField
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
          options={["Male", "Female", "Other"]}
        />
        <Field label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" required />
        <SelectField
          label="Marital Status"
          name="marital_status"
          value={formData.marital_status}
          onChange={handleChange}
          options={["Single", "Married", "Divorced", "Widowed"]}
        />
        <SelectField
          label="Blood Group"
          name="blood_group"
          value={formData.blood_group}
          onChange={handleChange}
          options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
        />
      </Section>

      <Section title="Contact Details">
        <Field label="Work Email" name="work_email" value={formData.work_email} onChange={handleChange} type="email" required />
        <Field label="Personal Email" name="personal_email" value={formData.personal_email} onChange={handleChange} type="email" />
        <Field label="Contact No." name="contact_no" value={formData.contact_no} onChange={handleChange} />
        <Field label="Emergency Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
        <SelectField
          label="Relation With Them"
          name="relation_with_them"
          value={formData.relation_with_them}
          onChange={handleChange}
          options={relationOptions}
        />
        <Field label="Emergency Contact No." name="emergency_contact_no" value={formData.emergency_contact_no} onChange={handleChange} />
      </Section>

      <Section title="Employment Details">
        <Field label="Government UID" name="govt_uid" value={formData.govt_uid} onChange={handleChange} />
        <Field label="Department Name" name="department_name" value={formData.department_name} onChange={handleChange} />
        <Field label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
        <Field label="Office Time Policy" name="office_time_policy" value={formData.office_time_policy} onChange={handleChange} />
        <Field label="Date of Joining" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} type="date" />
        <Field label="Shift Start Date" name="shift_start_date" value={formData.shift_start_date} onChange={handleChange} type="date" />
        <Field label="Resignation Date" name="resignation_date" value={formData.resignation_date} onChange={handleChange} type="date" />
        <SelectField
          label="Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={["Employee", "Intern"]}
        />
      </Section>

      <Section title="Bank Details">
        <Field label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleChange} />
        <Field label="Bank Account No." name="bank_account_no" value={formData.bank_account_no} onChange={handleChange} />
        <Field label="Bank IFSC Code" name="bank_ifsc_code" value={formData.bank_ifsc_code} onChange={handleChange} />
        <Field label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
      </Section>

      <Section title="Account Details">
        <Field label="Password" name="password" value={formData.password} onChange={handleChange} />
        <Field type="hidden" name="profile_type" value={formData.profile_type} onChange={handleChange} />
        <Field type="hidden"  name="profileimage" value={formData.profileimage} onChange={handleChange} />
      </Section>

      <input type="hidden" name="user_id" value={formData.user_id} />
      <input type="hidden" name="userid" value={formData.userid} />
      <input type="hidden" name="userId" value={formData.userId} />

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? "Updating..." : "Update Employee"}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
