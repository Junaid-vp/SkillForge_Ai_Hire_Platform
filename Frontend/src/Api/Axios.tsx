import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3005/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const failRequestdata = err.config;

    // ✅ Check response exists first
    if (
      err.response?.status === 401 &&
      !failRequestdata.retry &&
      !failRequestdata.url.includes("/auth/refresh")
    ) {
      failRequestdata.retry = true;

      try {
        await api.post("/auth/refresh");
        return api(failRequestdata);
      } catch (error) {
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