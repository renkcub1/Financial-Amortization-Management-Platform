import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiCreditCard, FiCalculator, FiTrendingUp, FiPieChart, FiBell, FiSettings, FiFileText, FiX, FiDollarSign } = FiIcons;

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Loan Management', href: '/loans', icon: FiCreditCard },
  { name: 'Payment Calculator', href: '/calculator', icon: FiCalculator },
  { name: 'Optimization Strategies', href: '/optimization', icon: FiTrendingUp },
  { name: 'Savings Analysis', href: '/savings', icon: FiPieChart },
  { name: 'Alerts & Reminders', href: '/alerts', icon: FiBell },
  { name: 'Scenario Simulations', href: '/scenarios', icon: FiSettings },
  { name: 'Reports', href: '/reports', icon: FiFileText },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

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
      <motion.div
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600">
                <SafeIcon icon={FiDollarSign} className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FinanceAM</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <SafeIcon icon={FiX} className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <SafeIcon
                    icon={item.icon}
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
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
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              Financial Amortization Manager v1.0
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;