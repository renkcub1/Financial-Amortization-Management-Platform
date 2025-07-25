import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiCalculator, FiDollarSign, FiCalendar, FiPercent, FiTrendingUp } = FiIcons;

const PaymentCalculator = () => {
  const [calculatorType, setCalculatorType] = useState('loan');
  const [formData, setFormData] = useState({
    principal: 250000,
    interestRate: 3.5,
    term: 360,
    extraPayment: 0,
    currentBalance: 250000,
    targetMonths: 0
  });

  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  const calculateLoanPayment = (principal, rate, term) => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return principal / term;
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                   (Math.pow(1 + monthlyRate, term) - 1);
    return payment;
  };

  const generateAmortizationSchedule = (principal, rate, term, extraPayment = 0) => {
    const monthlyRate = rate / 100 / 12;
    const basePayment = calculateLoanPayment(principal, rate, term);
    const totalPayment = basePayment + extraPayment;
    
    let balance = principal;
    let totalInterest = 0;
    const schedule = [];
    let month = 1;

    while (balance > 0.01 && month <= term) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = totalPayment - interestPayment;
      
      if (principalPayment > balance) {
        principalPayment = balance;
      }
      
      balance -= principalPayment;
      totalInterest += interestPayment;
      
      schedule.push({
        month,
        payment: principalPayment + interestPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        totalInterest
      });
      
      month++;
    }

    return {
      schedule,
      totalInterest,
      totalPayments: schedule.length,
      monthlyPayment: basePayment
    };
  };

  useEffect(() => {
    const { principal, interestRate, term, extraPayment } = formData;
    
    if (principal && interestRate && term) {
      const standardSchedule = generateAmortizationSchedule(principal, interestRate, term);
      const extraSchedule = extraPayment > 0 ? 
        generateAmortizationSchedule(principal, interestRate, term, extraPayment) : null;
      
      setResults({
        standard: standardSchedule,
        withExtra: extraSchedule
      });

      setAmortizationSchedule(standardSchedule.schedule.slice(0, 60)); // First 5 years
    }
  }, [formData]);

  const chartData = amortizationSchedule.map(item => ({
    month: item.month,
    principal: item.principal,
    interest: item.interest,
    balance: item.balance
  }));

  const paymentBreakdownOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `Month ${params[0].axisValue}<br/>
                Principal: $${params[0].value.toFixed(2)}<br/>
                Interest: $${params[1].value.toFixed(2)}`;
      }
    },
    legend: {
      data: ['Principal', 'Interest']
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.month),
      name: 'Month'
    },
    yAxis: {
      type: 'value',
      name: 'Payment Amount ($)',
      axisLabel: {
        formatter: '${value}'
      }
    },
    series: [
      {
        name: 'Principal',
        type: 'bar',
        stack: 'payment',
        data: chartData.map(item => item.principal),
        itemStyle: { color: '#22c55e' }
      },
      {
        name: 'Interest',
        type: 'bar',
        stack: 'payment',
        data: chartData.map(item => item.interest),
        itemStyle: { color: '#ef4444' }
      }
    ]
  };

  const balanceOption = {
    tooltip: {
      trigger: 'axis',
      formatter: 'Month {b}: ${c:,.0f}'
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.month),
      name: 'Month'
    },
    yAxis: {
      type: 'value',
      name: 'Remaining Balance ($)',
      axisLabel: {
        formatter: '${value:,.0f}'
      }
    },
    series: [
      {
        name: 'Balance',
        type: 'line',
        data: chartData.map(item => item.balance),
        itemStyle: { color: '#0ea5e9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14, 165, 233, 0.3)' },
              { offset: 1, color: 'rgba(14, 165, 233, 0.1)' }
            ]
          }
        }
      }
    ]
  };

  const calculatorTypes = [
    { id: 'loan', name: 'Loan Payment Calculator', icon: FiCalculator },
    { id: 'payoff', name: 'Loan Payoff Calculator', icon: FiCalendar },
    { id: 'refinance', name: 'Refinance Calculator', icon: FiTrendingUp }
  ];

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
            Payment Calculator
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Calculate payments, analyze amortization schedules, and explore scenarios
          </p>
        </div>
      </div>

      {/* Calculator Type Selector */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {calculatorTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setCalculatorType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                calculatorType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <SafeIcon 
                  icon={type.icon} 
                  className={`h-6 w-6 ${
                    calculatorType === type.id ? 'text-primary-600' : 'text-gray-400'
                  }`} 
                />
                <span className={`font-medium ${
                  calculatorType === type.id ? 'text-primary-900' : 'text-gray-700'
                }`}>
                  {type.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: parseFloat(e.target.value) || 0 })}
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
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setFormData({ ...formData, term: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Extra Monthly Payment ($)
                </label>
                <input
                  type="number"
                  value={formData.extraPayment}
                  onChange={(e) => setFormData({ ...formData, extraPayment: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          {results && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-gray-900">
                    ${results.standard.monthlyPayment.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Interest:</span>
                  <span className="font-semibold text-gray-900">
                    ${results.standard.totalInterest.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Payments:</span>
                  <span className="font-semibold text-gray-900">
                    {results.standard.totalPayments} months
                  </span>
                </div>
                
                {results.withExtra && (
                  <>
                    <hr className="my-3" />
                    <div className="text-sm text-gray-600 font-medium">With Extra Payment:</div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Interest Saved:</span>
                      <span className="font-semibold text-success-600">
                        ${(results.standard.totalInterest - results.withExtra.totalInterest).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Time Saved:</span>
                      <span className="font-semibold text-success-600">
                        {results.standard.totalPayments - results.withExtra.totalPayments} months
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Breakdown (First 5 Years)
            </h3>
            <div className="h-64">
              <ReactECharts option={paymentBreakdownOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Balance Over Time
            </h3>
            <div className="h-64">
              <ReactECharts option={balanceOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </Card>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      {amortizationSchedule.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Amortization Schedule (First 12 Months)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {amortizationSchedule.slice(0, 12).map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.payment.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.principal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.interest.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${row.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default PaymentCalculator;