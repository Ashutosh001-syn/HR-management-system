import { editUser, registerAdmin } from "@/api/adminApi";
import { formatDate, getUserIdentifierDetails, normalizeEmployee, RELATION_OPTIONS } from "@/utils/helpers";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_FORM_STATE = {
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
  attachments: [],
  photo: null,
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
};

function getInitialFormState(employee, isEdit) {
  if (!employee || !isEdit) {
    return { ...DEFAULT_FORM_STATE };
  }

  const raw = employee.raw || {};

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
    attachments: [],
    photo: null,
    bank_name: raw.bank_name || "",
    bank_account_no: raw.bank_account_no || "",
    bank_ifsc_code: raw.bank_ifsc_code || "",
    nationality: raw.nationality || "",
    password: "",
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
  };
}

export default function EmployeeForm({
  employee = null,
  isEdit = false,
  onSaved,
  onCancel,
  title,
  showTitle = true,
  submitLabel,
  allowReset = true,
}) {
  const attachmentsRef = useRef(null);
  const photoRef = useRef(null);
  const initialState = useMemo(() => getInitialFormState(employee, isEdit), [employee, isEdit]);

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    setFormData(initialState);
    setPhotoPreview(employee?.raw?.photo || employee?.raw?.profileimage || "");
    setSubmitError("");
  }, [employee, initialState]);

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nameOnlyFields = ["first_name", "last_name", "emergency_contact_name"];
    const isNameOnlyField = nameOnlyFields.includes(name);

    if (isNameOnlyField && value && !/^[A-Za-z\s]*$/.test(value)) {
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAttachmentsChange = (event) => {
    const files = Array.from(event.target.files || []);
    setFormData((current) => ({ ...current, attachments: files }));
  };

  // const handlePhotoChange = (event) => {
  //   const file = event.target.files?.[0] || null;
  //   setFormData((current) => ({ ...current, photo: file }));

  //   if (photoPreview?.startsWith("blob:")) {
  //     URL.revokeObjectURL(photoPreview);
  //   }

  //   setPhotoPreview(file ? URL.createObjectURL(file) : employee?.raw?.photo || employee?.raw?.profileimage || "");
  // };

  // const clearPhoto = () => {
  //   setFormData((current) => ({ ...current, photo: null }));

  //   if (photoPreview?.startsWith("blob:")) {
  //     URL.revokeObjectURL(photoPreview);
  //   }

  //   setPhotoPreview(employee?.raw?.photo || employee?.raw?.profileimage || "");

  //   if (photoRef.current) {
  //     photoRef.current.value = "";
  //   }
  // };

  const resetForm = () => {
    setFormData(getInitialFormState(employee, isEdit));
    setValidated(false);

    if (attachmentsRef.current) {
      attachmentsRef.current.value = "";
    }

    if (photoRef.current) {
      photoRef.current.value = "";
    }

    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(employee?.raw?.photo || employee?.raw?.profileimage || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      setSubmitError("Please complete all required fields before submitting.");
      form.reportValidity();
      const firstInvalidField = form.querySelector(":invalid");
      firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalidField?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    console.log("Attempting to create employee (isEdit:", isEdit, ") with formData:", formData);

    try {
      const { value: rawUserId, numericValue: numericUserId } = getUserIdentifierDetails(employee);
      const editTargetId = numericUserId || rawUserId;
      const response = isEdit && editTargetId
        ? await editUser(formData, editTargetId)
        : await registerAdmin(formData);

      const normalized = normalizeEmployee({
        ...employee?.raw,
        ...formData,
        ...response,
        id: response?.userid || response?.user_id || response?.userId || response?.id || employee?.id,
      });

      onSaved?.(normalized, response);

      if (!isEdit) {
        resetForm();
      }
    } catch (err) {
      console.error("Employee create/edit failed:", {
        isEdit,
        formDataKeys: Object.keys(formData),
        error: err,
        status: err.status,
        data: err.data
      });
      setSubmitError(err.message || "Failed to save employee. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const heading = title || (isEdit ? "Edit Employee" : "Employee Creation");
  const actionLabel = submitLabel || (isEdit ? "Update Employee" : "Save Employee");
  const relationOptions = useMemo(() => {
    const currentRelation = formData.relation_with_them?.trim();
    if (currentRelation && !RELATION_OPTIONS.includes(currentRelation)) {
      return [currentRelation, ...RELATION_OPTIONS];
    }

    return RELATION_OPTIONS;
  }, [formData.relation_with_them]);

  return (
    <>
      {showTitle && <h5 className="card-title mb-3">{heading}</h5>}

      <form ref={formRef} onSubmit={handleSubmit} noValidate className={validated ? "was-validated" : ""}>
        {submitError && <div className="alert alert-danger">{submitError}</div>}

        <div className="admin-form-section">
          <h6 className="mb-3">Primary Details</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} required className="form-control" />
              <div className="invalid-feedback">First name is required.</div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} required className="form-control" />
              <div className="invalid-feedback">Last name is required.</div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="form-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="invalid-feedback">Gender is required.</div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="form-control" />
              <div className="invalid-feedback">Date of birth is required.</div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Marital Status</label>
              <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="form-select">
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} required className="form-select">
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
                <option value="O-">O-</option>
              </select>
            </div>
            {isEdit && (
              <div className="col-12">
                <label className="form-label">Password (leave blank to keep current)</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" />
              </div>
            )}
          </div>
        </div>

        <div className="admin-form-section">
          <h6 className="mb-3">Contact Details</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Work Email</label>
              <input type="email" name="work_email" value={formData.work_email} onChange={handleChange} required className="form-control" />
              <div className="invalid-feedback">Work email is required.</div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Personal Email</label>
              <input type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact No.</label>
              <input name="contact_no" value={formData.contact_no} onChange={handleChange} required maxLength="10" className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Emergency Contact Name</label>
              <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Relation With Them</label>
              <select name="relation_with_them" value={formData.relation_with_them} onChange={handleChange} className="form-select">
                <option value="">Select</option>
                {relationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Emergency Contact No.</label>
              <input name="emergency_contact_no" value={formData.emergency_contact_no} onChange={handleChange} maxLength="10" className="form-control" />
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <h6 className="mb-3">Employment Details</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Government UID</label>
              <input name="govt_uid" value={formData.govt_uid} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <input name="department_name" value={formData.department_name} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input name="designation" value={formData.designation} onChange={handleChange} className="form-control" />
            </div>
            {/* <div className="col-md-6">
              <label className="form-label">Office Time Policy</label>
              <input name="office_time_policy" value={formData.office_time_policy} onChange={handleChange} className="form-control" />
            </div> */}
            <div className="col-md-4">
              <label className="form-label">Date of Joining</label>
              <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Shift Start Date</label>
              <input type="date" name="shift_start_date" value={formData.shift_start_date} onChange={handleChange} className="form-control" />
            </div>
            {/* <div className="col-md-4">
              <label className="form-label">Resignation Date</label>
              <input type="date" name="resignation_date" value={formData.resignation_date} onChange={handleChange} className="form-control" />
            </div> */}
            <div className="col-md-6">
              <label className="form-label">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="form-select">
                <option value="Employee">Employee</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>
        </div>

        {/* <div className="border rounded-3 p-3 mb-3 bg-white shadow-sm">
          <h6 className="mb-3">Bank Details</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Bank Name</label>
              <input name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Bank Account No.</label>
              <input name="bank_account_no" value={formData.bank_account_no} onChange={handleChange} maxLength="18" pattern="\d{9,18}" className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">IFSC Code</label>
              <input name="bank_ifsc_code" value={formData.bank_ifsc_code} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Nationality</label>
              <input name="nationality" value={formData.nationality} onChange={handleChange} className="form-control" />
            </div>
          </div>
        </div> */}

        <div className="admin-form-section">
          <h6 className="mb-3">Account Details</h6>
          <div className="row g-3">
            {!isEdit && (
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-control" />
                <div className="invalid-feedback">Password is required.</div>
              </div>
            )}
            {/* <div className="col-md-6">
              <label className="form-label">Profile Type</label>
              <input name="profile_type" value={formData.profile_type} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Profile Image</label>
              <input name="profileimage" value={formData.profileimage} onChange={handleChange} className="form-control" />
            </div> */}
          </div>
        </div>

        <div className="admin-form-section">
          <h6 className="mb-3">Attachments</h6>
          <div className="row g-3">
            {/* <div className="col-md-6">
              <label className="form-label">Photo</label>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} className="form-control" />
              {photoPreview && (
                <div className="mt-2 d-flex align-items-center gap-2">
                  <img src={photoPreview} alt="Preview" style={{ height: 64, width: 64, objectFit: "cover", borderRadius: 8 }} />
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={clearPhoto}>
                    Remove
                  </button>
                </div>
              )}
            </div> */}
            <div className="col-md-6">
              <label className="form-label">Attachments</label>
              <input ref={attachmentsRef} type="file" multiple onChange={handleAttachmentsChange} className="form-control" />
              <div className="form-text">You can attach multiple files.</div>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? (isEdit ? "Updating..." : "Saving...") : actionLabel}
          </button>
          {allowReset && (
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
              Reset
            </button>
          )}
          {onCancel && (
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}
