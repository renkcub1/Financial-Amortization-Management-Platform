import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays, isBefore, isToday, differenceInDays } from 'date-fns';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...alert
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const markAlertAsRead = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  };

  const generatePaymentAlerts = (loans) => {
    const today = new Date();
    const upcomingAlerts = [];

    loans.forEach(loan => {
      const dueDate = new Date(loan.dueDate);
      const daysUntilDue = differenceInDays(dueDate, today);

      if (daysUntilDue <= 3 && daysUntilDue >= 0) {
        upcomingAlerts.push({
          type: 'payment_due',
          severity: daysUntilDue === 0 ? 'high' : daysUntilDue <= 1 ? 'medium' : 'low',
          title: `Payment Due${daysUntilDue === 0 ? ' Today' : ` in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}`,
          message: `${loan.name} payment of $${loan.monthlyPayment.toLocaleString()} is due`,
          loanId: loan.id,
          dueDate: loan.dueDate
        });
      }

      // High credit utilization alert
      if (loan.type === 'credit_card' && loan.creditLimit) {
        const utilization = (loan.balance / loan.creditLimit) * 100;
        if (utilization > 80) {
          upcomingAlerts.push({
            type: 'high_utilization',
            severity: 'high',
            title: 'High Credit Utilization',
            message: `${loan.name} is at ${utilization.toFixed(1)}% utilization`,
            loanId: loan.id
          });
        }
      }
    });

    return upcomingAlerts;
  };

  const value = {
    alerts,
    notifications,
    addAlert,
    markAlertAsRead,
    removeAlert,
    clearAllAlerts,
    addNotification,
    generatePaymentAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};