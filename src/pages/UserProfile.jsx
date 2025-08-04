import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiUser, FiMail, FiShield, FiCalendar, FiEdit2, FiSave, FiX, FiCamera, FiTrash2 } = FiIcons;

const UserProfile = () => {
  const { user, updateProfile, roles } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [profileImage, setProfileImage] = useState(user?.avatar || null);
  const [showImageControls, setShowImageControls] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({ ...formData, avatar: profileImage });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setProfileImage(user?.avatar || null);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;
  
  const userRole = roles[user.role];

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
            User Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    icon={FiEdit2}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCancel}
                      icon={FiX}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      icon={FiSave}
                      size="sm"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="relative group" 
                      onMouseEnter={() => setShowImageControls(true)}
                      onMouseLeave={() => setShowImageControls(false)}
                    >
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center border-4 border-white shadow-md">
                          <span className="text-4xl font-medium text-white">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      )}
                      
                      <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full transition-opacity ${showImageControls ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                          >
                            <SafeIcon icon={FiCamera} className="h-5 w-5" />
                          </button>
                          {profileImage && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="p-2 bg-white rounded-full text-danger-600 hover:bg-gray-100"
                            >
                              <SafeIcon icon={FiTrash2} className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Click on the image to change your profile picture
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center border-4 border-white shadow-md">
                        <span className="text-4xl font-medium text-white">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiShield} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Role</p>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${userRole?.color}-100 text-${userRole?.color}-800`}
                        >
                          {userRole?.name || user.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-sm text-gray-900">
                          {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Role & Permissions */}
        <div className="space-y-6">
          <Card>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Role & Permissions
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Role</p>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-${userRole?.color}-100 text-${userRole?.color}-800 mt-1`}
                  >
                    {userRole?.name || user.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-600">{userRole?.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Permissions</p>
                  <div className="space-y-1">
                    {user.permissions.includes('all') ? (
                      <div className="text-sm text-gray-600">
                        • All permissions (Administrator)
                      </div>
                    ) : (
                      user.permissions.map((permission) => (
                        <div key={permission} className="text-sm text-gray-600">
                          • {permission.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${
                      user.status === 'active' ? 'success' : 'warning'
                    }-100 text-${user.status === 'active' ? 'success' : 'warning'}-800`}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Login</span>
                  <span className="text-sm text-gray-900">
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), 'MMM d, yyyy h:mm a')
                      : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Account Created</span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;