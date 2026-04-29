import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdminRoute = false, isOwnerRoute = false, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Use explicit allowedRoles if provided
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  }

  // Fallback to legacy hierarchy logic
  const roleHierarchy = { 'user': 1, 'admin': 2, 'sub-owner': 3, 'owner': 4, 'developer': 5 };
  const userLevel = roleHierarchy[role] || 1;
  
  let requiredLevel = 1;
  if (isOwnerRoute) requiredLevel = 3;
  else if (isAdminRoute) requiredLevel = 2;

  if (userLevel < requiredLevel) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;