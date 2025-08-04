import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiCalculator, FiDollarSign, FiCalendar, FiPercent, FiTrendingUp, FiRefreshCw } = FiIcons;

const PaymentCalculator = () => {
  const [calculatorType, setCalculatorType] = useState('loan');
  const [formData, setFormData] = useState({
    // Original loan data
    principal: 250000,
    interestRate: 3.5,
    term: 360,
    extraPayment: 0,
    currentBalance: 250000,
    remainingTerm: 300,
    
    // Refinance data
    newInterestRate: 2.8,
    newTerm: 360,
    closingCosts: 5000,
    cashOut: 0,
    
    // Payoff calculator data
    targetMonths: 0,
    additionalPayment: 0
  });
  
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  const calculateLoanPayment = (principal, rate, term) => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return principal / term;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
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

  const calculateRefinanceComparison = () => {
    const { currentBalance, interestRate, remainingTerm, newInterestRate, newTerm, closingCosts, cashOut } = formData;
    
    // Current loan calculations
    const currentPayment = calculateLoanPayment(currentBalance, interestRate, remainingTerm);
    const currentSchedule = generateAmortizationSchedule(currentBalance, interestRate, remainingTerm);
    
    // New loan calculations (including cash out)
    const newPrincipal = currentBalance + cashOut + closingCosts;
    const newPayment = calculateLoanPayment(newPrincipal, newInterestRate, newTerm);
    const newSchedule = generateAmortizationSchedule(newPrincipal, newInterestRate, newTerm);
    
    // Comparison metrics
    const monthlyDifference = newPayment - currentPayment;
    const totalInterestSavings = currentSchedule.totalInterest - newSchedule.totalInterest;
    const netSavings = totalInterestSavings - closingCosts;
    const breakEvenMonths = closingCosts / Math.abs(monthlyDifference);
    
    return {
      current: {
        payment: currentPayment,
        totalInterest: currentSchedule.totalInterest,
        totalPayments: currentSchedule.totalPayments,
        schedule: currentSchedule.schedule
      },
      new: {
        payment: newPayment,
        totalInterest: newSchedule.totalInterest,
        totalPayments: newSchedule.totalPayments,
        schedule: newSchedule.schedule
      },
      comparison: {
        monthlyDifference,
        totalInterestSavings,
        netSavings,
        breakEvenMonths: isFinite(breakEvenMonths) ? breakEvenMonths : 0,
        closingCosts,
        newPrincipal
      }
    };
  };

  const calculatePayoffScenario = () => {
    const { currentBalance, interestRate, additionalPayment, targetMonths } = formData;
    
    if (targetMonths > 0) {
      // Calculate required payment to payoff in target months
      const monthlyRate = interestRate / 100 / 12;
      const requiredPayment = currentBalance * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths)) / (Math.pow(1 + monthlyRate, targetMonths) - 1);
      const standardPayment = calculateLoanPayment(currentBalance, interestRate, 360);
      const extraNeeded = requiredPayment - standardPayment;
      
      return {
        requiredPayment,
        extraNeeded,
        standardPayment,
        targetMonths,
        totalPaid: requiredPayment * targetMonths,
        totalInterest: (requiredPayment * targetMonths) - currentBalance
      };
    } else if (additionalPayment > 0) {
      // Calculate time saved with additional payment
      const standardPayment = calculateLoanPayment(currentBalance, interestRate, 360);
      const newPayment = standardPayment + additionalPayment;
      const newSchedule = generateAmortizationSchedule(currentBalance, interestRate, 360, additionalPayment);
      const standardSchedule = generateAmortizationSchedule(currentBalance, interestRate, 360);
      
      return {
        newPayment,
        timeSaved: standardSchedule.totalPayments - newSchedule.totalPayments,
        interestSaved: standardSchedule.totalInterest - newSchedule.totalInterest,
        newTotalPayments: newSchedule.totalPayments,
        additionalPayment
      };
    }
    
    return null;
  };

  useEffect(() => {
    const { principal, interestRate, term, extraPayment } = formData;
    
    if (principal && interestRate && term) {
      let calculationResults = {};
      
      switch (calculatorType) {
        case 'loan':
          const standardSchedule = generateAmortizationSchedule(principal, interestRate, term);
          const extraSchedule = extraPayment > 0 ? generateAmortizationSchedule(principal, interestRate, term, extraPayment) : null;
          calculationResults = {
            standard: standardSchedule,
            withExtra: extraSchedule
          };
          setAmortizationSchedule(standardSchedule.schedule.slice(0, 60));
          break;
          
        case 'refinance':
          calculationResults = calculateRefinanceComparison();
          setAmortizationSchedule(calculationResults.current.schedule.slice(0, 60));
          break;
          
        case 'payoff':
          const payoffResults = calculatePayoffScenario();
          calculationResults = { payoff: payoffResults };
          if (payoffResults) {
            const schedule = generateAmortizationSchedule(formData.currentBalance, formData.interestRate, 360, formData.additionalPayment);
            setAmortizationSchedule(schedule.schedule.slice(0, 60));
          }
          break;
          
        default:
          break;
      }
      
      setResults(calculationResults);
    }
  }, [formData, calculatorType]);

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
        return `Month ${params[0].axisValue}<br/> Principal: $${params[0].value.toFixed(2)}<br/> Interest: $${params[1].value.toFixed(2)}`;
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
        formatter: function(value) {
          return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
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

  const refinanceComparisonOption = results?.current && results?.new ? {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `Month ${params[0].axisValue}<br/> Current: $${params[0].value.toFixed(2)}<br/> Refinanced: $${params[1].value.toFixed(2)}`;
      }
    },
    legend: {
      data: ['Current Loan', 'Refinanced Loan']
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 60 }, (_, i) => i + 1),
      name: 'Month'
    },
    yAxis: {
      type: 'value',
      name: 'Payment Amount ($)',
      axisLabel: {
        formatter: function(value) {
          return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
      }
    },
    series: [
      {
        name: 'Current Loan',
        type: 'line',
        data: Array(60).fill(results.current.payment),
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 3 }
      },
      {
        name: 'Refinanced Loan',
        type: 'line',
        data: Array(60).fill(results.new.payment),
        itemStyle: { color: '#22c55e' },
        lineStyle: { width: 3 }
      }
    ]
  } : {};

  const balanceOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `Month ${params[0].axisValue}: $${params[0].value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
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
        formatter: function(value) {
          return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
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
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14,165,233,0.3)' },
              { offset: 1, color: 'rgba(14,165,233,0.1)' }
            ]
          }
        }
      }
    ]
  };

  const calculatorTypes = [
    { id: 'loan', name: 'Loan Payment Calculator', icon: FiCalculator },
    { id: 'refinance', name: 'Refinance Calculator', icon: FiRefreshCw },
    { id: 'payoff', name: 'Loan Payoff Calculator', icon: FiCalendar }
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
            Calculate payments, analyze amortization schedules, and explore refinancing scenarios
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
                <span
                  className={`font-medium ${
                    calculatorType === type.id ? 'text-primary-900' : 'text-gray-700'
                  }`}
                >
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
              {calculatorType === 'loan' && 'Loan Details'}
              {calculatorType === 'refinance' && 'Refinance Details'}
              {calculatorType === 'payoff' && 'Payoff Details'}
            </h3>
            
            <div className="space-y-4">
              {/* Common fields */}
              {calculatorType === 'loan' && (
                <>
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
                </>
              )}

              {calculatorType === 'refinance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Balance ($)
                    </label>
                    <input
                      type="number"
                      value={formData.currentBalance}
                      onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Interest Rate (%)
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
                      Remaining Term (months)
                    </label>
                    <input
                      type="number"
                      value={formData.remainingTerm}
                      onChange={(e) => setFormData({ ...formData, remainingTerm: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.newInterestRate}
                      onChange={(e) => setFormData({ ...formData, newInterestRate: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Loan Term (months)
                    </label>
                    <input
                      type="number"
                      value={formData.newTerm}
                      onChange={(e) => setFormData({ ...formData, newTerm: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Closing Costs ($)
                    </label>
                    <input
                      type="number"
                      value={formData.closingCosts}
                      onChange={(e) => setFormData({ ...formData, closingCosts: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cash Out Amount ($)
                    </label>
                    <input
                      type="number"
                      value={formData.cashOut}
                      onChange={(e) => setFormData({ ...formData, cashOut: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              {calculatorType === 'payoff' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Balance ($)
                    </label>
                    <input
                      type="number"
                      value={formData.currentBalance}
                      onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) || 0 })}
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
                      Target Payoff (months) - OR -
                    </label>
                    <input
                      type="number"
                      value={formData.targetMonths}
                      onChange={(e) => setFormData({ ...formData, targetMonths: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Payment ($)
                    </label>
                    <input
                      type="number"
                      value={formData.additionalPayment}
                      onChange={(e) => setFormData({ ...formData, additionalPayment: parseFloat(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Results Summary */}
          {results && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {calculatorType === 'loan' && 'Payment Summary'}
                {calculatorType === 'refinance' && 'Refinance Analysis'}
                {calculatorType === 'payoff' && 'Payoff Analysis'}
              </h3>
              
              {calculatorType === 'loan' && results.standard && (
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
              )}

              {calculatorType === 'refinance' && results.comparison && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Payment:</span>
                    <span className="font-semibold text-gray-900">
                      ${results.current.payment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Payment:</span>
                    <span className="font-semibold text-gray-900">
                      ${results.new.payment.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Difference:</span>
                    <span className={`font-semibold ${results.comparison.monthlyDifference < 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {results.comparison.monthlyDifference < 0 ? '-' : '+'}${Math.abs(results.comparison.monthlyDifference).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Interest Savings:</span>
                    <span className={`font-semibold ${results.comparison.totalInterestSavings > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      ${results.comparison.totalInterestSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Net Savings:</span>
                    <span className={`font-semibold ${results.comparison.netSavings > 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      ${results.comparison.netSavings.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Break-even:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round(results.comparison.breakEvenMonths)} months
                    </span>
                  </div>
                </div>
              )}

              {calculatorType === 'payoff' && results.payoff && (
                <div className="space-y-3">
                  {results.payoff.requiredPayment && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Required Payment:</span>
                        <span className="font-semibold text-gray-900">
                          ${results.payoff.requiredPayment.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Extra Needed:</span>
                        <span className="font-semibold text-primary-600">
                          ${results.payoff.extraNeeded.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                  {results.payoff.timeSaved && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Time Saved:</span>
                        <span className="font-semibold text-success-600">
                          {results.payoff.timeSaved} months
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Interest Saved:</span>
                        <span className="font-semibold text-success-600">
                          ${results.payoff.interestSaved.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {calculatorType === 'refinance' && results?.current && results?.new ? (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Comparison
              </h3>
              <div className="h-64">
                <ReactECharts
                  option={refinanceComparisonOption}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </Card>
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Breakdown (First 5 Years)
              </h3>
              <div className="h-64">
                <ReactECharts
                  option={paymentBreakdownOption}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Loan Balance Over Time
            </h3>
            <div className="h-64">
              <ReactECharts
                option={balanceOption}
                style={{ height: '100%', width: '100%' }}
              />
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

      {/* Refinance Recommendation */}
      {calculatorType === 'refinance' && results?.comparison && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Refinance Recommendation
          </h3>
          <div className={`p-4 rounded-lg border-2 ${
            results.comparison.netSavings > 0 
              ? 'border-success-200 bg-success-50' 
              : 'border-warning-200 bg-warning-50'
          }`}>
            <div className="flex items-start space-x-3">
              <SafeIcon 
                icon={results.comparison.netSavings > 0 ? FiTrendingUp : FiPercent} 
                className={`h-6 w-6 mt-0.5 ${
                  results.comparison.netSavings > 0 ? 'text-success-600' : 'text-warning-600'
                }`} 
              />
              <div>
                <h4 className={`font-semibold ${
                  results.comparison.netSavings > 0 ? 'text-success-900' : 'text-warning-900'
                }`}>
                  {results.comparison.netSavings > 0 ? 'Refinancing Recommended' : 'Consider Alternatives'}
                </h4>
                <p className={`mt-1 ${
                  results.comparison.netSavings > 0 ? 'text-success-800' : 'text-warning-800'
                }`}>
                  {results.comparison.netSavings > 0 
                    ? `You could save $${results.comparison.netSavings.toFixed(2)} over the life of the loan. Break-even point is ${Math.round(results.comparison.breakEvenMonths)} months.`
                    : `This refinance would cost you $${Math.abs(results.comparison.netSavings).toFixed(2)} over the life of the loan. Consider other options or wait for better rates.`
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default PaymentCalculator;