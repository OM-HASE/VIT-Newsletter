import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import StudentLogin from "../pages/auth/StudentLogin";
import TeacherLogin from "../pages/auth/TeacherLogin";
import Register from "../pages/auth/Register";

import StudentDashboard from "../pages/student/StudentDashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";

import Newsletter from "../pages/public/Newsletter";

import ProtectedRoute from "../components/ProtectedRoute";
import PostPage from "../pages/PostPage";
import Profile from "../pages/Profile";

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/newsletter" />} />
      <Route path="/newsletter" element={<Newsletter />} />
      <Route path="/post/:id" element={<PostPage />} />
      <Route path="/profile" element={<Profile />} />

      {/* Auth */}
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/teacher-login" element={<TeacherLogin />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboards */}
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/teacher-dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      
    </Routes>
  );
}

export default AppRoutes;