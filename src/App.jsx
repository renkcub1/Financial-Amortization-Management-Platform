import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoanProvider } from './context/LoanContext';
import { AlertProvider } from './context/AlertContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginForm from './components/auth/LoginForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LoanManagement from './pages/LoanManagement';
import PaymentCalculator from './pages/PaymentCalculator';
import OptimizationStrategies from './pages/OptimizationStrategies';
import SavingsAnalysis from './pages/SavingsAnalysis';
import AlertsReminders from './pages/AlertsReminders';
import ScenarioSimulations from './pages/ScenarioSimulations';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import UserProfile from './pages/UserProfile';
import RolePermissions from './pages/RolePermissions';

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 flex overflow-hidden`}>
      {/* Sidebar component - fixed on left side for desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />
      
      {/* Main content area - with proper padding to accommodate sidebar */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          darkMode={darkMode} 
          onDarkModeToggle={toggleDarkMode} 
        />
        <main className="flex-1 overflow-auto dark:bg-gray-900">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <Dashboard />
                  </ProtectedRoute>} />
                  <Route path="/loans" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <LoanManagement />
                  </ProtectedRoute>} />
                  <Route path="/calculator" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <PaymentCalculator />
                  </ProtectedRoute>} />
                  <Route path="/optimization" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <OptimizationStrategies />
                  </ProtectedRoute>} />
                  <Route path="/savings" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <SavingsAnalysis />
                  </ProtectedRoute>} />
                  <Route path="/alerts" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <AlertsReminders />
                  </ProtectedRoute>} />
                  <Route path="/scenarios" element={<ProtectedRoute requiredPermission="view_own_loans">
                    <ScenarioSimulations />
                  </ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute requiredPermission="view_reports">
                    <Reports />
                  </ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute requiredPermission="manage_users">
                    <UserManagement />
                  </ProtectedRoute>} />
                  <Route path="/roles" element={<ProtectedRoute requiredPermission="manage_roles">
                    <RolePermissions />
                  </ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute requiredPermission="manage_own_profile">
                    <UserProfile />
                  </ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LoanProvider>
        <AlertProvider>
          <Router>
            <AppContent />
          </Router>
        </AlertProvider>
      </LoanProvider>
    </AuthProvider>
  );
}

export default App;