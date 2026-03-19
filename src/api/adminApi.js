import apiClient from "@/api/apiClient";
import { createMultipartFormData } from "@/utils/helpers";

function asMultipartBody(payload, extra = {}) {
  return payload instanceof FormData ? payload : createMultipartFormData(payload, extra);
}

export async function registerAdmin(payload) {
  const response = await apiClient.post("/register", asMultipartBody(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function loginAdmin({ email, password }) {
  const body = createMultipartFormData({ email, password });
  const response = await apiClient.post("/login", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getUsersDetail(params = {}) {
  const response = await apiClient.get("/get_users_detail", { params });
  return response.data;
}

export async function editUser(payload, userId) {
  const normalizedUserId = userId ? String(userId).trim() : "";
  const numericUserId = normalizedUserId.replace(/[^\d]/g, "");
  const response = await apiClient.post("/edit_users", asMultipartBody(payload, {
    user_id: numericUserId || normalizedUserId,
    userid: numericUserId || normalizedUserId,
    userId: numericUserId || normalizedUserId,
  }), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteUser(userId) {
  const numericId = String(userId).replace(/[^\d]/g, "");
  const response = await apiClient.post("/delete_users", { user_id: numericId });
  return response.data;
}

export async function getLeaveRequests(params = {}) {
  const response = await apiClient.get("/get_allUser_leaveRequest", { params });
  return response.data;
}

export async function updateLeaveStatus({ leave_id, user_id, action }) {
  const body = createMultipartFormData({
    leave_id,
    user_id,
    request_status: action,
  });

  const response = await apiClient.post("/update-leave-status", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function getAttendanceByStatus(params = {}) {
  const response = await apiClient.post("/get_attendance_ByStatus", createMultipartFormData(params), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getDashboardDetail() {
  const response = await apiClient.get("/get_dashboard_detail");
  return response.data;
}
