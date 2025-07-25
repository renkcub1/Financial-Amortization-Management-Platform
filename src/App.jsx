import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import LoanManagement from './pages/LoanManagement';
import PaymentCalculator from './pages/PaymentCalculator';
import OptimizationStrategies from './pages/OptimizationStrategies';
import SavingsAnalysis from './pages/SavingsAnalysis';
import AlertsReminders from './pages/AlertsReminders';
import ScenarioSimulations from './pages/ScenarioSimulations';
import Reports from './pages/Reports';
import { LoanProvider } from './context/LoanContext';
import { AlertProvider } from './context/AlertContext';

function App() {
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

  return (
    <LoanProvider>
      <AlertProvider>
        <Router>
          <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="lg:pl-64">
              <Header 
                onMenuClick={() => setSidebarOpen(true)}
                darkMode={darkMode}
                onDarkModeToggle={() => setDarkMode(!darkMode)}
              />
              
              <main className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/loans" element={<LoanManagement />} />
                      <Route path="/calculator" element={<PaymentCalculator />} />
                      <Route path="/optimization" element={<OptimizationStrategies />} />
                      <Route path="/savings" element={<SavingsAnalysis />} />
                      <Route path="/alerts" element={<AlertsReminders />} />
                      <Route path="/scenarios" element={<ScenarioSimulations />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </AnimatePresence>
                </div>
              </main>
            </div>
          </div>
        </Router>
      </AlertProvider>
    </LoanProvider>
  );
}

export default App;