import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUsers, FiLock } = FiIcons;

const RoleManager = () => {
  const { roles, addRole, updateRole, deleteRole, users } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'primary',
    permissions: []
  });

  const availablePermissions = [
    { id: 'all', name: 'All Permissions', description: 'Complete system access' },
    { id: 'view_own_loans', name: 'View Own Loans', description: 'View personal loan data' },
    { id: 'manage_own_loans', name: 'Manage Own Loans', description: 'Create and edit personal loans' },
    { id: 'view_all_loans', name: 'View All Loans', description: 'View all users\' loan data' },
    { id: 'manage_all_loans', name: 'Manage All Loans', description: 'Edit any user\'s loans' },
    { id: 'view_reports', name: 'View Reports', description: 'Access reporting features' },
    { id: 'generate_reports', name: 'Generate Reports', description: 'Create and export reports' },
    { id: 'manage_clients', name: 'Manage Clients', description: 'Oversee client accounts' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics dashboard' },
    { id: 'manage_own_profile', name: 'Manage Own Profile', description: 'Edit personal profile' },
    { id: 'manage_users', name: 'Manage Users', description: 'Create and edit user accounts' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Create and edit user roles' },
    { id: 'system_settings', name: 'System Settings', description: 'Configure system settings' }
  ];

  const colorOptions = [
    { value: 'primary', label: 'Primary Blue', class: 'bg-primary-100 text-primary-800' },
    { value: 'success', label: 'Success Green', class: 'bg-success-100 text-success-800' },
    { value: 'warning', label: 'Warning Orange', class: 'bg-warning-100 text-warning-800' },
    { value: 'danger', label: 'Danger Red', class: 'bg-danger-100 text-danger-800' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-800' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-800' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const roleData = {
      ...formData,
      permissions: formData.permissions.includes('all') ? ['all'] : formData.permissions
    };

    if (editingRole) {
      updateRole(editingRole, roleData);
    } else {
      addRole(roleData);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: 'primary',
      permissions: []
    });
    setEditingRole(null);
    setIsModalOpen(false);
  };

  const handleEdit = (roleKey) => {
    const role = roles[roleKey];
    setFormData({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: [...role.permissions]
    });
    setEditingRole(roleKey);
    setIsModalOpen(true);
  };

  const handleDelete = (roleKey) => {
    const usersWithRole = users.filter(user => user.role === roleKey);
    if (usersWithRole.length > 0) {
      alert(`Cannot delete role "${roles[roleKey].name}". ${usersWithRole.length} user(s) are assigned to this role.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the role "${roles[roleKey].name}"?`)) {
      deleteRole(roleKey);
    }
  };

  const togglePermission = (permissionId) => {
    if (permissionId === 'all') {
      setFormData({
        ...formData,
        permissions: formData.permissions.includes('all') ? [] : ['all']
      });
    } else {
      const newPermissions = formData.permissions.includes(permissionId)
        ? formData.permissions.filter(p => p !== permissionId && p !== 'all')
        : [...formData.permissions.filter(p => p !== 'all'), permissionId];
      
      setFormData({
        ...formData,
        permissions: newPermissions
      });
    }
  };

  const getRoleUserCount = (roleKey) => {
    return users.filter(user => user.role === roleKey).length;
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage user roles and permissions
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={FiPlus}
            className="shadow-sm"
          >
            Add New Role
          </Button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(roles).map(([roleKey, role]) => (
          <motion.div
            key={roleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative h-full">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`inline-flex items-center justify-center p-2 bg-${role.color}-50 rounded-lg`}>
                      <SafeIcon icon={FiShield} className={`h-5 w-5 text-${role.color}-600`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${role.color}-100 text-${role.color}-800`}>
                      {getRoleUserCount(roleKey)} user{getRoleUserCount(roleKey) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(roleKey)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  {roleKey !== 'admin' && (
                    <button
                      onClick={() => handleDelete(roleKey)}
                      className="p-1 text-gray-400 hover:text-danger-500"
                    >
                      <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Permissions
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {role.permissions.includes('all') ? (
                      <div className="text-xs text-gray-600 font-medium">
                        ✓ All System Permissions
                      </div>
                    ) : (
                      role.permissions.map((permission) => {
                        const permissionInfo = availablePermissions.find(p => p.id === permission);
                        return (
                          <div key={permission} className="text-xs text-gray-600">
                            ✓ {permissionInfo?.name || permission}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingRole ? 'Edit Role' : 'Add New Role'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Financial Advisor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Color Theme
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Describe the role and its responsibilities"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      formData.permissions.includes(permission.id) || 
                      (formData.permissions.includes('all') && permission.id !== 'all')
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => togglePermission(permission.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        formData.permissions.includes(permission.id) || 
                        (formData.permissions.includes('all') && permission.id !== 'all')
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300'
                      }`}>
                        {(formData.permissions.includes(permission.id) || 
                          (formData.permissions.includes('all') && permission.id !== 'all')) && (
                          <SafeIcon icon={FiCheck} className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {permission.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoleManager;