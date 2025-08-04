import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiCreditCard, FiCalculator, FiTrendingUp, FiPieChart, FiBell, FiSettings, FiFileText, FiX, FiUsers, FiUser, FiShield } = FiIcons;

const Sidebar = ({ isOpen, onClose, darkMode }) => {
  const location = useLocation();
  const { hasPermission, hasRole } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome, permission: 'view_own_loans' },
    { name: 'Loan Management', href: '/loans', icon: FiCreditCard, permission: 'view_own_loans' },
    { name: 'Payment Calculator', href: '/calculator', icon: FiCalculator, permission: 'view_own_loans' },
    { name: 'Optimization Strategies', href: '/optimization', icon: FiTrendingUp, permission: 'view_own_loans' },
    { name: 'Savings Analysis', href: '/savings', icon: FiPieChart, permission: 'view_own_loans' },
    { name: 'Alerts & Reminders', href: '/alerts', icon: FiBell, permission: 'view_own_loans' },
    { name: 'Scenario Simulations', href: '/scenarios', icon: FiSettings, permission: 'view_own_loans' },
    { name: 'Reports', href: '/reports', icon: FiFileText, permission: 'view_reports' },
    { name: 'User Management', href: '/users', icon: FiUsers, permission: 'manage_users' },
    { name: 'Role & Permissions', href: '/roles', icon: FiShield, permission: 'manage_roles' },
    { name: 'Profile', href: '/profile', icon: FiUser, permission: 'manage_own_profile' }
  ];

  const filteredNavigation = navigation.filter(item => {
    if (item.role) {
      return hasRole(item.role);
    }
    if (item.permission) {
      return hasPermission(item.permission);
    }
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed lg:fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg overflow-hidden">
                <img
                  src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1753790412403-KPCapitalLogo_500X500.whitebackground.fw_.png"
                  alt="KPCS Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">KPCS</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <SafeIcon icon={FiX} className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive
                        ? 'text-primary-500'
                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 w-0.5 h-6 bg-primary-500 rounded-l"
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              KPCS Financial Management System v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;