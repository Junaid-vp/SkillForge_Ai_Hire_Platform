import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3005/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const failRequestdata = err.config;
    const requestUrl = failRequestdata?.url || "";
    const isSessionCheckRequest =
      requestUrl.includes("/auth/hr/me") || requestUrl.includes("/dev/me");

    // ✅ Check response exists first
    if (
      err.response?.status === 401 &&
      !failRequestdata.retry &&
      !requestUrl.includes("/auth/refresh")
    ) {
      failRequestdata.retry = true;

      try {
        await api.post("/auth/refresh");
        return api(failRequestdata);
      } catch (error) {
        // Do not hard-redirect for background auth status checks.
        // Let callers handle unauthenticated state gracefully.
        if (isSessionCheckRequest) {
          return Promise.reject(error);
        }

        // Redirect to the right login page based on current app section.
        const isDevFlow =
          window.location.pathname.startsWith("/dev") ||
          window.location.pathname.startsWith("/DevInterviewRoom");
        window.location.href = isDevFlow ? "/devLogin" : "/";
        return Promise.reject(error);
      }
    }

    return Promise.reject(err);
  }
);