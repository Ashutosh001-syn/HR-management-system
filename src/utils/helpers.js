export const SIDEBAR_WIDTH = 280;
export const TOPBAR_HEIGHT = 56;
export const EMPTY_VALUE = "-";
export const RELATION_OPTIONS = [
  "Father",
  "Mother",
  "Husband",
  "Wife",
  "Brother",
  "Sister",
  "Guardian",
  "Relative",
];

export function formatDate(value) {
  if (!value) return EMPTY_VALUE;

  try {
    if (typeof value === "string") {
      return value.split("T")[0];
    }

    return new Date(value).toISOString().split("T")[0];
  } catch {
    return EMPTY_VALUE;
  }
}

export function formatDisplayDate(value) {
  if (!value) return EMPTY_VALUE;

  try {
    const date = typeof value === "string" && !value.includes("T")
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return EMPTY_VALUE;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return EMPTY_VALUE;
  }
}

export function formatTime(value) {
  if (!value) return EMPTY_VALUE;
  return typeof value === "string" ? value.trim() || EMPTY_VALUE : String(value);
}

export function getEmployeeName(employee) {
  return [employee?.first_name, employee?.last_name].filter(Boolean).join(" ").trim()
    || employee?.name
    || "Employee";
}

export function normalizeLeaveStatus(status) {
  if (!status) return "Pending";

  const lower = String(status).toLowerCase().trim();
  if (lower === "pending") return "Pending";
  if (lower === "approved") return "Approved";
  if (lower === "rejected") return "Rejected";

  return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
}

export function normalizeAttendanceStatus(status) {
  if (!status) return "Unknown";

  const lower = String(status).toLowerCase().trim();
  if (lower === "present") return "Present";
  if (lower === "absent") return "Absent";
  if (lower === "late" || lower === "l") return "Late";
  if (["halfday", "half_day", "half day", "hd"].includes(lower)) return "Half Day";

  return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
}

function toIsoDate(value) {
  if (!value && value !== 0) return null;

  try {
    if (value instanceof Date) return value.toISOString();

    if (typeof value === "number") {
      const milliseconds = value < 1e12 ? value * 1000 : value;
      return new Date(milliseconds).toISOString();
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export function normalizeEmployee(user, index = 0) {
  return {
    id: user?.userid || user?.user_id || user?.userId || user?.id || user?.emp_id || user?._id || `EMP-${index + 1}`,
    name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.name || "Unknown",
    department: user?.department_name || user?.department || EMPTY_VALUE,
    designation: user?.designation || EMPTY_VALUE,
    email: user?.work_email || user?.email || EMPTY_VALUE,
    phone: user?.contact_no || user?.phone || EMPTY_VALUE,
    raw: {
      ...user,
      profile_type: user?.profile_type || user?.profileType || "",
    },
  };
}

export function getUserIdentifierDetails(user = {}) {
  const raw = user?.raw || user;
  const candidates = [
    raw?.userid,
    raw?.user_id,
    raw?.userId,
    raw?.uid,
    raw?.id,
    user?.userid,
    user?.user_id,
    user?.userId,
    user?.uid,
    user?.id,
  ].filter((value) => value !== null && value !== undefined && value !== "");

  const value = candidates[0] ? String(candidates[0]).trim() : "";
  const numericValue = value.replace(/[^\d]/g, "");

  return {
    value,
    numericValue,
  };
}

export function normalizeLeaveRecord(record, index = 0) {
  const rawFrom = record?.fromdate ?? record?.from ?? record?.start ?? record?.startDate ?? record?.fromDate ?? record?.from_date ?? record?.leave_from ?? record?.start_date ?? null;
  const rawTo = record?.todate ?? record?.to ?? record?.end ?? record?.endDate ?? record?.toDate ?? record?.to_date ?? record?.leave_to ?? record?.end_date ?? null;

  return {
    leave_id: record?.leave_id ?? record?.id ?? record?.leaveId ?? `LEV-${index + 1}`,
    leavetype: record?.leavetype ?? record?.leaveType ?? record?.type ?? "NA",
    fromdate: toIsoDate(rawFrom),
    todate: toIsoDate(rawTo),
    totalleavedays: record?.totalleavedays ?? record?.totalDays ?? record?.days ?? record?.duration ?? 0,
    reasonforleave: record?.reasonforleave ?? record?.reason ?? record?.note ?? "",
    request_status: normalizeLeaveStatus(record?.request_status ?? record?.status ?? record?.requestStatus ?? "Pending"),
    created_at: toIsoDate(record?.created_at ?? record?.createdAt ?? record?.created_at_ts ?? record?.createdTs ?? null),
    user_id: record?.user_id ?? record?.userid ?? record?.userId ?? record?.employeeId ?? record?.empId ?? null,
    first_name: record?.first_name ?? record?.firstname ?? record?.firstName ?? record?.employeeFirstName ?? "",
    last_name: record?.last_name ?? record?.lastname ?? record?.lastName ?? record?.employeeLastName ?? "",
    work_email: record?.work_email ?? record?.workEmail ?? record?.email ?? record?.workemail ?? "",
    raw: record,
  };
}

export function normalizeAttendanceRecord(record, index = 0) {
  const loginDate = record?.login_date ?? record?.attendanceDate ?? record?.date ?? record?.created_at ?? null;
  const punchIn = record?.punch_in ?? record?.punchIn ?? record?.check_in ?? record?.checkIn ?? record?.start_time ?? record?.startTime ?? record?.start ?? null;
  const punchOut = record?.punch_out ?? record?.punchOut ?? record?.check_out ?? record?.checkOut ?? record?.end_time ?? record?.endTime ?? record?.end ?? null;
  const totalHours = record?.totalHours ?? record?.total_hours ?? record?.working_hours ?? record?.duration ?? record?.total_work_hours ?? null;

  return {
    attendance_id: record?.attendance_id ?? record?.id ?? `ATT-${index + 1}`,
    user_id: record?.user_id ?? record?.userid ?? record?.userId ?? record?.employeeId ?? record?.empId ?? null,
    first_name: record?.first_name ?? record?.firstName ?? record?.employeeFirstName ?? "",
    last_name: record?.last_name ?? record?.lastName ?? record?.employeeLastName ?? "",
    status: normalizeAttendanceStatus(record?.status),
    login_date: loginDate,
    punch_in: formatTime(punchIn),
    punch_out: formatTime(punchOut),
    total_hours: formatTime(totalHours),
    reason: record?.reason || record?.absent_reason || "",
    raw: record,
  };
}

export function appendFormValue(formData, key, value) {
  if (value === null || value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(formData, key, item));
    return;
  }

  if (value instanceof File) {
    formData.append(key, value, value.name);
    return;
  }

  formData.append(key, value);
}

export function createMultipartFormData(payload = {}, extra = {}) {
  const formData = new FormData();
  Object.entries({ ...payload, ...extra }).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });
  return formData;
}
