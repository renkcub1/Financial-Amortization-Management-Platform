import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit2, FiTrash2, FiCreditCard, FiHome, FiTruck, FiUser, FiPercent, FiCalendar, FiDollarSign } = FiIcons;

const LoanManagement = () => {
  const { loans, addLoan, updateLoan, deleteLoan } = useLoan();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'personal',
    balance: '',
    originalAmount: '',
    interestRate: '',
    monthlyPayment: '',
    dueDate: '',
    term: '',
    minimumPayment: '',
    creditLimit: '',
    startDate: ''
  });

  const loanTypes = [
    { value: 'mortgage', label: 'Mortgage', icon: FiHome },
    { value: 'credit_card', label: 'Credit Card', icon: FiCreditCard },
    { value: 'auto', label: 'Auto Loan', icon: FiTruck },
    { value: 'personal', label: 'Personal Loan', icon: FiUser },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const loanData = {
      ...formData,
      balance: parseFloat(formData.balance),
      originalAmount: parseFloat(formData.originalAmount),
      interestRate: parseFloat(formData.interestRate),
      monthlyPayment: parseFloat(formData.monthlyPayment),
      minimumPayment: parseFloat(formData.minimumPayment || formData.monthlyPayment),
      term: formData.term ? parseInt(formData.term) : null,
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
      isActive: true
    };

    if (editingLoan) {
      updateLoan({ ...editingLoan, ...loanData });
    } else {
      addLoan(loanData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'personal',
      balance: '',
      originalAmount: '',
      interestRate: '',
      monthlyPayment: '',
      dueDate: '',
      term: '',
      minimumPayment: '',
      creditLimit: '',
      startDate: ''
    });
    setEditingLoan(null);
    setIsModalOpen(false);
  };

  const handleEdit = (loan) => {
    setFormData({
      name: loan.name,
      type: loan.type,
      balance: loan.balance.toString(),
      originalAmount: loan.originalAmount.toString(),
      interestRate: loan.interestRate.toString(),
      monthlyPayment: loan.monthlyPayment.toString(),
      dueDate: loan.dueDate,
      term: loan.term?.toString() || '',
      minimumPayment: loan.minimumPayment?.toString() || '',
      creditLimit: loan.creditLimit?.toString() || '',
      startDate: loan.startDate || ''
    });
    setEditingLoan(loan);
    setIsModalOpen(true);
  };

  const handleDelete = (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      deleteLoan(loanId);
    }
  };

  const getLoanIcon = (type) => {
    const typeMap = {
      mortgage: FiHome,
      credit_card: FiCreditCard,
      auto: FiTruck,
      personal: FiUser
    };
    return typeMap[type] || FiUser;
  };

  const getProgressPercentage = (loan) => {
    if (!loan.originalAmount) return 0;
    return ((loan.originalAmount - loan.balance) / loan.originalAmount) * 100;
  };

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
            Loan Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your loans and track their progress
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            icon={FiPlus}
            className="shadow-sm"
          >
            Add New Loan
          </Button>
        </div>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan, index) => (
          <motion.div
            key={loan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative h-full">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center p-2 bg-primary-50 rounded-lg">
                      <SafeIcon icon={getLoanIcon(loan.type)} className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{loan.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {loan.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(loan)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <SafeIcon icon={FiEdit2} className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(loan.id)}
                    className="p-1 text-gray-400 hover:text-danger-500"
                  >
                    <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Current Balance</span>
                    <span className="font-semibold text-gray-900">
                      ${loan.balance.toLocaleString()}
                    </span>
                  </div>
                  {loan.originalAmount && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{getProgressPercentage(loan).toFixed(1)}% paid</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressPercentage(loan)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Interest Rate</span>
                    <span className="font-medium text-gray-900">{loan.interestRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Monthly Payment</span>
                    <span className="font-medium text-gray-900">
                      ${loan.monthlyPayment.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500 block">Next Due Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {loan.type === 'credit_card' && loan.creditLimit && (
                  <div className="text-sm">
                    <span className="text-gray-500 block">Credit Utilization</span>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {((loan.balance / loan.creditLimit) * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        ${loan.creditLimit.toLocaleString()} limit
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Loan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingLoan ? 'Edit Loan' : 'Add New Loan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Primary Mortgage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {loanTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Balance
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Original Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.originalAmount}
                onChange={(e) => setFormData({ ...formData, originalAmount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Payment
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Next Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Term (months)
              </label>
              <input
                type="number"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {formData.type === 'credit_card' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Credit Limit
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
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
              {editingLoan ? 'Update Loan' : 'Add Loan'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default LoanManagement;