import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

/* AUTH */
import StudentLogin from "../pages/auth/StudentLogin";
import TeacherLogin from "../pages/auth/TeacherLogin";
import Register from "../pages/auth/Register";

/* DASHBOARDS */
import StudentDashboard from "../pages/student/StudentDashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

/* PUBLIC */
import Newsletter from "../pages/public/Newsletter";
import PostPage from "../pages/PostPage";
import Profile from "../pages/Profile";

/* PROTECTED */
import ProtectedRoute from "../components/ProtectedRoute";

/* ADMIN ROUTE */
const AdminRoute = ({ children }) => {
  const { user } =
    useContext(AuthContext);

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <Navigate to="/newsletter" />
    );
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>

      {/* DEFAULT */}
      <Route
        path="/"
        element={
          <Navigate to="/newsletter" />
        }
      />

      {/* PUBLIC */}
      <Route
        path="/newsletter"
        element={<Newsletter />}
      />

      <Route
        path="/post/:id"
        element={<PostPage />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      {/* AUTH */}
      <Route
        path="/student-login"
        element={<StudentLogin />}
      />

      <Route
        path="/teacher-login"
        element={<TeacherLogin />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* STUDENT */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* TEACHER + ADMIN */}
      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;