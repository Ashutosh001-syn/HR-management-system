import axios from "axios";

const FALLBACK_BASE_URL = "http://103.185.75.124:5009/api/admin";
const FALLBACK_API_ORIGIN = "http://103.185.75.124:5009";
const configuredBaseUrl = import.meta.env.VITE_API_URL || FALLBACK_BASE_URL;

function resolveApiOrigin(baseUrl) {
  try {
    const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : FALLBACK_API_ORIGIN;
    return new URL(baseUrl, fallbackOrigin).origin;
  } catch {
    return FALLBACK_API_ORIGIN;
  }
}

function createClient(baseURL) {
  return axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
}

function attachCommonInterceptors(client) {
  client.interceptors.request.use((config) => {
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

  client.interceptors.response.use(
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
}

export const API_ORIGIN = resolveApiOrigin(configuredBaseUrl);
export const API_ROOT_URL = new URL("/api/", `${API_ORIGIN}/`).toString().replace(/\/$/, "");

const apiClient = createClient(configuredBaseUrl);
export const apiRootClient = createClient(API_ROOT_URL);

attachCommonInterceptors(apiClient);
attachCommonInterceptors(apiRootClient);

export default apiClient;
