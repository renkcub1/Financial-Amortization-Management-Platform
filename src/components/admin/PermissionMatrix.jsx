import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiShield, FiLock, FiUnlock } = FiIcons;

const PermissionMatrix = () => {
  const { roles, updateRole } = useAuth();
  const [expandedRole, setExpandedRole] = useState(null);

  const permissions = [
    { id: 'view_own_loans', name: 'View Own Loans', category: 'Loans' },
    { id: 'manage_own_loans', name: 'Manage Own Loans', category: 'Loans' },
    { id: 'view_all_loans', name: 'View All Loans', category: 'Loans' },
    { id: 'manage_all_loans', name: 'Manage All Loans', category: 'Loans' },
    { id: 'view_reports', name: 'View Reports', category: 'Reports' },
    { id: 'generate_reports', name: 'Generate Reports', category: 'Reports' },
    { id: 'manage_clients', name: 'Manage Clients', category: 'Users' },
    { id: 'view_analytics', name: 'View Analytics', category: 'Analytics' },
    { id: 'manage_own_profile', name: 'Manage Own Profile', category: 'Profile' },
    { id: 'manage_users', name: 'Manage Users', category: 'Admin' },
    { id: 'manage_roles', name: 'Manage Roles', category: 'Admin' },
    { id: 'system_settings', name: 'System Settings', category: 'Admin' }
  ];

  const categories = [...new Set(permissions.map(p => p.category))];

  const hasPermission = (role, permissionId) => {
    return role.permissions.includes('all') || role.permissions.includes(permissionId);
  };

  const togglePermission = (roleKey, permissionId) => {
    const role = roles[roleKey];
    if (role.permissions.includes('all')) {
      // If role has 'all' permissions, don't allow individual toggles
      return;
    }

    const newPermissions = role.permissions.includes(permissionId)
      ? role.permissions.filter(p => p !== permissionId)
      : [...role.permissions, permissionId];

    updateRole(roleKey, { ...role, permissions: newPermissions });
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Permission Matrix</h3>
          <p className="mt-1 text-sm text-gray-500">
            Visual overview of role permissions across the system
          </p>
        </div>
      </div>

      {/* Desktop Matrix View */}
      <Card className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                {Object.entries(roles).map(([roleKey, role]) => (
                  <th key={roleKey} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${role.color}-100 text-${role.color}-800`}>
                        {role.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <React.Fragment key={category}>
                  <tr className="bg-gray-50">
                    <td colSpan={Object.keys(roles).length + 1} className="px-6 py-2 text-sm font-medium text-gray-900">
                      {category}
                    </td>
                  </tr>
                  {permissions
                    .filter(p => p.category === category)
                    .map((permission) => (
                      <tr key={permission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {permission.name}
                        </td>
                        {Object.entries(roles).map(([roleKey, role]) => (
                          <td key={roleKey} className="px-3 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => togglePermission(roleKey, permission.id)}
                              disabled={role.permissions.includes('all')}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                                hasPermission(role, permission.id)
                                  ? 'bg-success-100 text-success-600'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              } ${role.permissions.includes('all') ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {hasPermission(role, permission.id) ? (
                                <SafeIcon icon={FiCheck} className="h-4 w-4" />
                              ) : (
                                <SafeIcon icon={FiX} className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {Object.entries(roles).map(([roleKey, role]) => (
          <Card key={roleKey}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedRole(expandedRole === roleKey ? null : roleKey)}
            >
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center justify-center p-2 bg-${role.color}-50 rounded-lg`}>
                  <SafeIcon icon={FiShield} className={`h-5 w-5 text-${role.color}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <SafeIcon 
                icon={expandedRole === roleKey ? FiUnlock : FiLock} 
                className="h-5 w-5 text-gray-400" 
              />
            </div>

            {expandedRole === roleKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                {role.permissions.includes('all') ? (
                  <div className="text-center py-4">
                    <SafeIcon icon={FiShield} className="h-8 w-8 text-success-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">All Permissions Granted</p>
                    <p className="text-xs text-gray-500">This role has complete system access</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {permissions
                            .filter(p => p.category === category)
                            .map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                              >
                                <span className="text-sm text-gray-700">{permission.name}</span>
                                <button
                                  onClick={() => togglePermission(roleKey, permission.id)}
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                                    hasPermission(role, permission.id)
                                      ? 'bg-success-100 text-success-600'
                                      : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                  }`}
                                >
                                  {hasPermission(role, permission.id) ? (
                                    <SafeIcon icon={FiCheck} className="h-4 w-4" />
                                  ) : (
                                    <SafeIcon icon={FiX} className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PermissionMatrix;