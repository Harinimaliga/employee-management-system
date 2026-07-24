import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
