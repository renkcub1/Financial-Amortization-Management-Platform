import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const { FiFileText, FiDownload, FiPrinter, FiMail, FiCalendar, FiTrendingUp, FiDollarSign, FiPieChart } = FiIcons;

const Reports = () => {
  const { loans, paymentHistory } = useLoan();
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState('ytd');

  const reportTypes = [
    {
      id: 'summary',
      name: 'Portfolio Summary',
      description: 'Overview of all loans and current status',
      icon: FiPieChart
    },
    {
      id: 'payment_history',
      name: 'Payment History',
      description: 'Detailed payment tracking and trends',
      icon: FiCalendar
    },
    {
      id: 'amortization',
      name: 'Amortization Schedule',
      description: 'Future payment breakdown and projections',
      icon: FiTrendingUp
    },
    {
      id: 'tax_summary',
      name: 'Tax Summary',
      description: 'Interest deductions and tax-related information',
      icon: FiFileText
    }
  ];

  const exportFormats = [
    { id: 'pdf', name: 'PDF', icon: FiFileText },
    { id: 'excel', name: 'Excel', icon: FiDownload },
    { id: 'print', name: 'Print', icon: FiPrinter },
    { id: 'email', name: 'Email', icon: FiMail }
  ];

  const generatePortfolioSummary = () => {
    const totalDebt = loans.reduce((sum, loan) => sum + loan.balance, 0);
    const totalOriginal = loans.reduce((sum, loan) => sum + (loan.originalAmount || loan.balance), 0);
    const totalMonthlyPayments = loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
    const totalInterestPaid = totalOriginal - totalDebt;
    const averageInterestRate = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length;

    const loansByType = loans.reduce((acc, loan) => {
      const type = loan.type.replace('_', ' ').toUpperCase();
      if (!acc[type]) {
        acc[type] = { count: 0, balance: 0, payment: 0 };
      }
      acc[type].count++;
      acc[type].balance += loan.balance;
      acc[type].payment += loan.monthlyPayment;
      return acc;
    }, {});

    return {
      totalDebt,
      totalOriginal,
      totalMonthlyPayments,
      totalInterestPaid,
      averageInterestRate,
      loansByType,
      totalProgress: ((totalOriginal - totalDebt) / totalOriginal) * 100
    };
  };

  const portfolioSummary = generatePortfolioSummary();

  const portfolioChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ${c:,.0f} ({d}%)'
    },
    series: [
      {
        name: 'Loan Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n${c:,.0f}'
        },
        data: Object.entries(portfolioSummary.loansByType).map(([type, data]) => ({
          value: data.balance,
          name: type,
        }))
      }
    ],
    color: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']
  };

  const paymentTrendOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>
                Monthly Payment: $${params[0].value.toLocaleString()}<br/>
                Principal: $${params[1].value.toLocaleString()}<br/>
                Interest: $${params[2].value.toLocaleString()}`;
      }
    },
    legend: {
      data: ['Total Payment', 'Principal', 'Interest']
    },
    xAxis: {
      type: 'category',
      data: loans.map(loan => loan.name),
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '${value:,.0f}'
      }
    },
    series: [
      {
        name: 'Total Payment',
        type: 'bar',
        data: loans.map(loan => loan.monthlyPayment),
        itemStyle: { color: '#0ea5e9' }
      },
      {
        name: 'Principal',
        type: 'bar',
        data: loans.map(loan => loan.monthlyPayment * 0.7), // Approximation
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'Interest',
        type: 'bar',
        data: loans.map(loan => loan.monthlyPayment * 0.3), // Approximation
        itemStyle: { color: '#ef4444' }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    }
  };

  const handleExport = async (format) => {
    switch (format) {
      case 'pdf':
        // Implement PDF export
        console.log('Exporting to PDF...');
        break;
      case 'excel':
        // Implement Excel export
        console.log('Exporting to Excel...');
        break;
      case 'print':
        window.print();
        break;
      case 'email':
        // Implement email functionality
        console.log('Sending via email...');
        break;
      default:
        break;
    }
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
            Financial Reports
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate comprehensive reports and export your financial data
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          {exportFormats.map((format) => (
            <Button
              key={format.id}
              onClick={() => handleExport(format.id)}
              icon={format.icon}
              variant="outline"
              size="sm"
            >
              {format.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedReport === report.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <SafeIcon icon={report.icon} className={`h-6 w-6 ${
                    selectedReport === report.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    selectedReport === report.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {report.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {report.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Portfolio Summary Report */}
      {selectedReport === 'summary' && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-3 bg-danger-50 rounded-lg">
                    <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-danger-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total Debt</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${portfolioSummary.totalDebt.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-50 rounded-lg">
                    <SafeIcon icon={FiCalendar} className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Monthly Payments</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${portfolioSummary.totalMonthlyPayments.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-3 bg-success-50 rounded-lg">
                    <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-success-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {portfolioSummary.totalProgress.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-3 bg-warning-50 rounded-lg">
                    <SafeIcon icon={FiPieChart} className="h-6 w-6 text-warning-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Avg Interest Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {portfolioSummary.averageInterestRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Debt Distribution by Type
              </h3>
              <div className="h-64">
                <ReactECharts option={portfolioChartOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Breakdown by Loan
              </h3>
              <div className="h-64">
                <ReactECharts option={paymentTrendOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </Card>
          </div>

          {/* Loan Details Table */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Portfolio Details
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interest Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => {
                    const progress = loan.originalAmount ? 
                      ((loan.originalAmount - loan.balance) / loan.originalAmount) * 100 : 0;
                    
                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {loan.type.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${loan.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.interestRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${loan.monthlyPayment.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(loan.dueDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Summary by Loan Type */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Summary by Loan Type
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(portfolioSummary.loansByType).map(([type, data]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{type}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loans:</span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Balance:</span>
                      <span className="font-medium">${data.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Payment:</span>
                      <span className="font-medium">${data.payment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Other report types can be implemented similarly */}
      {selectedReport !== 'summary' && (
        <Card>
          <div className="text-center py-12">
            <SafeIcon icon={FiFileText} className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </h3>
            <p className="text-gray-500">
              This report type is coming soon. Stay tuned for more detailed financial reporting features.
            </p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default Reports;