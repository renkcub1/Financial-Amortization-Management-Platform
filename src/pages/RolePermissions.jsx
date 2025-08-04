import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import RoleManager from '../components/admin/RoleManager';
import PermissionMatrix from '../components/admin/PermissionMatrix';

const { FiShield, FiGrid, FiList, FiUsers } = FiIcons;

const RolePermissions = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('roles');

  if (!hasPermission('manage_roles') && !hasPermission('all')) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-96 text-center"
      >
        <div className="bg-danger-50 rounded-full p-6 mb-6">
          <SafeIcon icon={FiShield} className="h-12 w-12 text-danger-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to manage roles and permissions.
        </p>
      </motion.div>
    );
  }

  const tabs = [
    {
      id: 'roles',
      name: 'Role Management',
      icon: FiUsers,
      description: 'Create and manage user roles'
    },
    {
      id: 'matrix',
      name: 'Permission Matrix',
      icon: FiGrid,
      description: 'Visual permission overview'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Role & Permission Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure user roles, permissions, and access control
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon
                  icon={tab.icon}
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    activeTab === tab.id
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'roles' && <RoleManager />}
          {activeTab === 'matrix' && <PermissionMatrix />}
        </div>
      </Card>
    </motion.div>
  );
};

export default RolePermissions;