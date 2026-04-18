import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access');
  const role = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard if role not allowed
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
