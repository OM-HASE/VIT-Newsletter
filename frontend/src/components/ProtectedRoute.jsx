import { useContext } from "react";

import { Navigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  role,
}) => {
  const {
    isAuthenticated,
    user,
  } = useContext(AuthContext);

  /* NOT LOGGED IN */
  if (!isAuthenticated()) {
    return (
      <Navigate to="/student-login" />
    );
  }

  /* ADMIN CAN ACCESS EVERYTHING */
  if (user?.role === "admin") {
    return children;
  }

  /* ROLE CHECK */
  if (
    role &&
    user?.role !== role
  ) {
    return (
      <Navigate to="/newsletter" />
    );
  }

  return children;
};

export default ProtectedRoute;