import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role?.toLowerCase())) {
    // Redirect to appropriate dashboard based on role
    const role = user?.role?.toLowerCase();
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (['cfo', 'director', 'manager', 'financer'].includes(role)) {
      return <Navigate to="/manager/dashboard" replace />;
    } else {
      return <Navigate to="/employee/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;