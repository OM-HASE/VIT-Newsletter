import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
});

// REQUEST
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (error.response && error.response.status === 403) {
      console.log("Forbidden");
    }

    if (error.response && error.response.status === 500) {
      console.log("Server Error");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;