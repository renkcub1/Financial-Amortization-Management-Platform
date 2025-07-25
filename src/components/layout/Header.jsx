import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useLoan } from '../../context/LoanContext';
import { useAlert } from '../../context/AlertContext';

const { FiMenu, FiSun, FiMoon, FiBell, FiUser } = FiIcons;

const Header = ({ onMenuClick, darkMode, onDarkModeToggle }) => {
  const { getTotalDebt, getTotalMonthlyPayments } = useLoan();
  const { alerts } = useAlert();
  
  const unreadAlerts = alerts.filter(alert => !alert.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={onMenuClick}
            >
              <SafeIcon icon={FiMenu} className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:flex lg:items-center lg:space-x-8 ml-4">
              <div className="text-sm">
                <span className="text-gray-500">Total Debt:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  ${getTotalDebt().toLocaleString()}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Monthly Payments:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  ${getTotalMonthlyPayments().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={onDarkModeToggle}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <SafeIcon icon={darkMode ? FiSun : FiMoon} className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors">
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
            </div>

            {/* User menu */}
            <div className="relative">
              <button className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <SafeIcon icon={FiUser} className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">John Doe</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;