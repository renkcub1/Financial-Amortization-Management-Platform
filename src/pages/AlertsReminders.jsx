import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import { useAlert } from '../context/AlertContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format, addDays, differenceInDays } from 'date-fns';

const { FiBell, FiCheck, FiX, FiAlertTriangle, FiClock, FiSettings, FiPlus, FiTrash2 } = FiIcons;

const AlertsReminders = () => {
  const { loans } = useLoan();
  const { alerts, addAlert, markAlertAsRead, removeAlert, clearAllAlerts, generatePaymentAlerts } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [customAlertForm, setCustomAlertForm] = useState({
    title: '',
    message: '',
    type: 'reminder',
    date: '',
    loanId: ''
  });

  useEffect(() => {
    const paymentAlerts = generatePaymentAlerts(loans);
    paymentAlerts.forEach(alert => {
      const existingAlert = alerts.find(a => 
        a.type === alert.type && 
        a.loanId === alert.loanId &&
        !a.read
      );
      if (!existingAlert) {
        addAlert(alert);
      }
    });
  }, [loans]);

  const alertTypes = [
    { value: 'payment_due', label: 'Payment Due', icon: FiClock, color: 'text-warning-600' },
    { value: 'high_utilization', label: 'High Utilization', icon: FiAlertTriangle, color: 'text-danger-600' },
    { value: 'rate_change', label: 'Rate Change', icon: FiBell, color: 'text-primary-600' },
    { value: 'reminder', label: 'Custom Reminder', icon: FiBell, color: 'text-gray-600' }
  ];

  const severityColors = {
    low: 'border-primary-200 bg-primary-50',
    medium: 'border-warning-200 bg-warning-50',
    high: 'border-danger-200 bg-danger-50'
  };

  const severityTextColors = {
    low: 'text-primary-900',
    medium: 'text-warning-900',
    high: 'text-danger-900'
  };

  const handleCreateCustomAlert = (e) => {
    e.preventDefault();
    const newAlert = {
      ...customAlertForm,
      severity: 'low',
      timestamp: new Date(),
      read: false
    };
    addAlert(newAlert);
    setCustomAlertForm({
      title: '',
      message: '',
      type: 'reminder',
      date: '',
      loanId: ''
    });
    setIsModalOpen(false);
  };

  const getAlertIcon = (type) => {
    const typeMap = {
      payment_due: FiClock,
      high_utilization: FiAlertTriangle,
      rate_change: FiBell,
      reminder: FiBell
    };
    return typeMap[type] || FiBell;
  };

  const upcomingPayments = loans
    .filter(loan => loan.isActive)
    .map(loan => {
      const dueDate = new Date(loan.dueDate);
      const daysUntil = differenceInDays(dueDate, new Date());
      return { ...loan, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const unreadAlerts = alerts.filter(alert => !alert.read);
  const readAlerts = alerts.filter(alert => alert.read);

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
            Alerts & Reminders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Stay on top of your payments and important financial deadlines
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={FiPlus}
            variant="outline"
          >
            Custom Alert
          </Button>
          {alerts.length > 0 && (
            <Button
              onClick={clearAllAlerts}
              icon={FiTrash2}
              variant="outline"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center p-3 bg-danger-50 rounded-lg">
                <SafeIcon icon={FiAlertTriangle} className="h-6 w-6 text-danger-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadAlerts.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center p-3 bg-warning-50 rounded-lg">
                <SafeIcon icon={FiClock} className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Upcoming Payments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {upcomingPayments.filter(p => p.daysUntil <= 7).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center p-3 bg-primary-50 rounded-lg">
                <SafeIcon icon={FiBell} className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unreadAlerts.length > 0 ? (
              unreadAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${severityColors[alert.severity]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <SafeIcon 
                        icon={getAlertIcon(alert.type)} 
                        className={`h-5 w-5 mt-0.5 ${severityTextColors[alert.severity]}`} 
                      />
                      <div>
                        <h4 className={`font-semibold ${severityTextColors[alert.severity]}`}>
                          {alert.title}
                        </h4>
                        <p className={`text-sm mt-1 ${severityTextColors[alert.severity]} opacity-80`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(alert.timestamp), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => markAlertAsRead(alert.id)}
                        className="p-1 text-gray-400 hover:text-green-500"
                      >
                        <SafeIcon icon={FiCheck} className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <SafeIcon icon={FiX} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCheck} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active alerts</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Payments</h3>
            <SafeIcon icon={FiClock} className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {upcomingPayments.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{loan.name}</p>
                  <p className="text-sm text-gray-500">
                    Due: {format(new Date(loan.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${loan.monthlyPayment.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    loan.daysUntil <= 1 ? 'text-danger-600' :
                    loan.daysUntil <= 3 ? 'text-warning-600' : 'text-gray-500'
                  }`}>
                    {loan.daysUntil === 0 ? 'Due today' :
                     loan.daysUntil === 1 ? 'Due tomorrow' :
                     `${loan.daysUntil} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Alert History */}
      {readAlerts.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {readAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={getAlertIcon(alert.type)} className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{alert.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(alert.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Custom Alert Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Alert"
        size="md"
      >
        <form onSubmit={handleCreateCustomAlert} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alert Title</label>
            <input
              type="text"
              required
              value={customAlertForm.title}
              onChange={(e) => setCustomAlertForm({ ...customAlertForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., Review credit card rates"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              required
              value={customAlertForm.message}
              onChange={(e) => setCustomAlertForm({ ...customAlertForm, message: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Detailed description of the alert..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Alert Type</label>
            <select
              value={customAlertForm.type}
              onChange={(e) => setCustomAlertForm({ ...customAlertForm, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {alertTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Related Loan (Optional)</label>
            <select
              value={customAlertForm.loanId}
              onChange={(e) => setCustomAlertForm({ ...customAlertForm, loanId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select a loan...</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>{loan.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Alert
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default AlertsReminders;