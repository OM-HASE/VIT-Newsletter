import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

function AuthProvider({ children }) {
  const navigate = useNavigate();

  // ✅ Initialize directly (NO useEffect)
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (err) {
      console.error("Auth init error:", err);
      localStorage.clear();
      return null;
    }
  });

  // ✅ LOGIN
  const login = (data) => {
    // ⚠️ IMPORTANT: normalize structure
    const userData = data.user || data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    // ✅ Role-based redirect
    if (userData.role === "student") {
      navigate("/student-dashboard");
    } else if (userData.role === "teacher" || userData.role === "admin") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/");
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/");
  };

  // ✅ AUTH CHECK
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;