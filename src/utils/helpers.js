export const SIDEBAR_WIDTH = 280;
export const SIDEBAR_COLLAPSED_WIDTH = 96;
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

export function calculateTotalHours(punchIn, punchOut) {
  if (!punchIn || !punchOut) return "0:00";

  try {
    // Helper to extract HH:MM from string (HH:MM or ISO datetime)
    const extractTime = (timeStr) => {
      if (!timeStr) return null;
      const str = timeStr.toString().trim();
      // Try HH:MM first
      let match = str.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        return { hours, minutes };
      }
      // Try ISO datetime (e.g., 2024-01-01T09:30:00)
      match = str.match(/T(\d{2}):(\d{2}):/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        return { hours, minutes };
      }
      return null;
    };

    const inTime = extractTime(punchIn);
    const outTime = extractTime(punchOut);

    if (!inTime || !outTime) return "0:00";

    const inMinutes = inTime.hours * 60 + inTime.minutes;
    const outMinutes = outTime.hours * 60 + outTime.minutes;

    let totalMinutes = outMinutes - inMinutes;
    if (totalMinutes < 0) totalMinutes = 0;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  } catch {
    return "0:00";
  }
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

export function normalizeWifiStatus(status) {
  if (!status) return "Unknown";

  const lower = String(status).toLowerCase().trim();
  if (lower === "active") return "Active";
  if (lower === "inactive") return "Inactive";
  if (lower === "enabled") return "Active";
  if (lower === "disabled") return "Inactive";

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
  const punchInRaw = record?.punch_in ?? record?.punchIn ?? record?.check_in ?? record?.checkIn ?? record?.start_time ?? record?.startTime ?? record?.start ?? null;
  const punchOutRaw = record?.punch_out ?? record?.punchOut ?? record?.check_out ?? record?.checkOut ?? record?.end_time ?? record?.endTime ?? record?.end ?? null;

  return {
    attendance_id: record?.attendance_id ?? record?.id ?? `ATT-${index + 1}`,
    user_id: record?.user_id ?? record?.userid ?? record?.userId ?? record?.employeeId ?? record?.empId ?? null,
    first_name: record?.first_name ?? record?.firstName ?? record?.employeeFirstName ?? "",
    last_name: record?.last_name ?? record?.lastName ?? record?.employeeLastName ?? "",
    status: normalizeAttendanceStatus(record?.status),
    login_date: loginDate,
    punch_in: formatTime(punchInRaw),
    punch_out: formatTime(punchOutRaw),
    total_hours: calculateTotalHours(punchInRaw, punchOutRaw),
    reason: record?.reason || record?.absent_reason || "",
    raw: record,
  };
}

export function normalizeWifiRecord(record, index = 0) {
  return {
    network_id: record?.network_id ?? record?.networkId ?? record?.id ?? record?.insertId ?? `WIFI-${index + 1}`,
    name: record?.name ?? record?.network_name ?? record?.networkName ?? record?.ssid ?? EMPTY_VALUE,
    status: normalizeWifiStatus(record?.status ?? record?.network_status ?? record?.networkStatus),
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

export function formatDateRange(fromDate, toDate) {
  if (!fromDate || !toDate) return EMPTY_VALUE;
  
  try {
    const from = formatDate(fromDate);
    const to = formatDate(toDate);
    return `${from} → ${to}`;
  } catch {
    return EMPTY_VALUE;
  }
}
