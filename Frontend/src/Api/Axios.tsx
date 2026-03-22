import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api",
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
        // ✅ Redirect to login if refresh fails
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    return Promise.reject(err);
  }
);