import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLock } = FiIcons;

const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return null; // Will be handled by App.jsx
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-96 text-center"
      >
        <div className="bg-danger-50 rounded-full p-6 mb-6">
          <SafeIcon icon={FiLock} className="h-12 w-12 text-danger-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You need {requiredRole} role to access this page.
        </p>
        <p className="text-sm text-gray-500">
          Current role: <span className="font-medium">{user.role}</span>
        </p>
      </motion.div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-96 text-center"
      >
        <div className="bg-warning-50 rounded-full p-6 mb-6">
          <SafeIcon icon={FiLock} className="h-12 w-12 text-warning-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this feature.
        </p>
        <p className="text-sm text-gray-500">
          Required permission: <span className="font-medium">{requiredPermission}</span>
        </p>
      </motion.div>
    );
  }

  return children;
};

export default ProtectedRoute;