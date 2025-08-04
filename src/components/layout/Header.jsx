import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLoan } from '../../context/LoanContext';
import { useAlert } from '../../context/AlertContext';
import { useNavigate } from 'react-router-dom';

const { FiMenu, FiSun, FiMoon, FiBell, FiUser, FiSettings, FiLogOut, FiChevronDown } = FiIcons;

const Header = ({ onMenuClick, darkMode, onDarkModeToggle }) => {
  const { user, logout, hasPermission } = useAuth();
  const { getTotalDebt, getTotalMonthlyPayments } = useLoan();
  const { alerts } = useAlert();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const unreadAlerts = alerts.filter(alert => !alert.read).length;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleNotificationClick = () => {
    setShowNotifications(false);
    navigate('/alerts');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            {/* Hamburger menu button - visible only on mobile */}
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              onClick={onMenuClick}
            >
              <SafeIcon icon={FiMenu} className="h-6 w-6" />
            </button>
            {hasPermission('view_all_loans') && (
              <div className="hidden lg:flex lg:items-center lg:space-x-8 ml-4">
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Debt:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    ${getTotalDebt().toLocaleString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Monthly Payments:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                    ${getTotalMonthlyPayments().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <SafeIcon icon={darkMode ? FiSun : FiMoon} className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <SafeIcon icon={FiBell} className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-4 w-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </motion.span>
                )}
              </button>
              
              {/* Notification dropdown (optional for quick preview) */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                    onMouseLeave={() => setShowNotifications(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                        <span className="text-xs text-primary-600 dark:text-primary-400 cursor-pointer" onClick={handleNotificationClick}>
                          View all
                        </span>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {alerts.slice(0, 3).map(alert => (
                        <div key={alert.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={handleNotificationClick}>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{alert.message}</p>
                        </div>
                      ))}
                      {alerts.length === 0 && (
                        <div className="px-4 py-3 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={`${user.firstName} ${user.lastName}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </div>
                </div>
                <SafeIcon icon={FiChevronDown} className="h-4 w-4 text-gray-400" />
              </button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <a
                    href="/#/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <SafeIcon icon={FiUser} className="h-4 w-4 mr-3" />
                    Your Profile
                  </a>
                  {hasPermission('all') && (
                    <a
                      href="/#/users"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <SafeIcon icon={FiSettings} className="h-4 w-4 mr-3" />
                      User Management
                    </a>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-700"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <SafeIcon icon={FiLogOut} className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;