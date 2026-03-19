import axios from "axios";

const FALLBACK_BASE_URL = "http://103.185.75.124:5009/api/admin";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || FALLBACK_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const userid = localStorage.getItem("userid");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userid) {
    config.headers.userid = userid;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status ?? null;
    const data = error?.response?.data ?? null;

    return Promise.reject({
      status,
      data,
      message:
        (typeof data === "string" && data) ||
        data?.message ||
        data?.error ||
        error.message ||
        "Request failed",
      isNetworkError: !error?.response,
      config: error?.config,
    });
  }
);

export default apiClient;
