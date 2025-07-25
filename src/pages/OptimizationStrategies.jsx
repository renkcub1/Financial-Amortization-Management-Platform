import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiTarget, FiTrendingUp, FiDollarSign, FiClock, FiZap, FiBarChart } = FiIcons;

const OptimizationStrategies = () => {
  const { loans } = useLoan();
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');
  const [extraBudget, setExtraBudget] = useState(500);
  const [optimizationResults, setOptimizationResults] = useState(null);

  const strategies = [
    {
      id: 'avalanche',
      name: 'Debt Avalanche',
      description: 'Pay minimums on all debts, then put extra money toward the highest interest rate debt',
      icon: FiTarget,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50'
    },
    {
      id: 'snowball',
      name: 'Debt Snowball',
      description: 'Pay minimums on all debts, then put extra money toward the smallest balance',
      icon: FiTrendingUp,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      id: 'hybrid',
      name: 'Hybrid Strategy',
      description: 'Balance between psychological wins and mathematical optimization',
      icon: FiZap,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50'
    }
  ];

  const calculateAvalancheStrategy = (loans, extraBudget) => {
    const sortedLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);
    let totalMonths = 0;
    let totalInterest = 0;
    let remainingBudget = extraBudget;
    const paymentPlan = [];

    sortedLoans.forEach(loan => {
      const monthlyPayment = loan.monthlyPayment + (remainingBudget > 0 ? remainingBudget : 0);
      const monthsToPayoff = Math.ceil(loan.balance / monthlyPayment);
      const interestPaid = (monthlyPayment * monthsToPayoff) - loan.balance;
      
      totalMonths = Math.max(totalMonths, monthsToPayoff);
      totalInterest += interestPaid;
      
      paymentPlan.push({
        loanId: loan.id,
        loanName: loan.name,
        monthlyPayment,
        monthsToPayoff,
        interestPaid,
        totalPaid: monthlyPayment * monthsToPayoff,
        extraPayment: remainingBudget > 0 ? remainingBudget : 0
      });
      
      remainingBudget = 0; // Only first loan gets extra payment in avalanche
    });

    return { paymentPlan, totalMonths, totalInterest, strategy: 'avalanche' };
  };

  const calculateSnowballStrategy = (loans, extraBudget) => {
    const sortedLoans = [...loans].sort((a, b) => a.balance - b.balance);
    let totalMonths = 0;
    let totalInterest = 0;
    let remainingBudget = extraBudget;
    const paymentPlan = [];

    sortedLoans.forEach(loan => {
      const monthlyPayment = loan.monthlyPayment + (remainingBudget > 0 ? remainingBudget : 0);
      const monthsToPayoff = Math.ceil(loan.balance / monthlyPayment);
      const interestPaid = (monthlyPayment * monthsToPayoff) - loan.balance;
      
      totalMonths = Math.max(totalMonths, monthsToPayoff);
      totalInterest += interestPaid;
      
      paymentPlan.push({
        loanId: loan.id,
        loanName: loan.name,
        monthlyPayment,
        monthsToPayoff,
        interestPaid,
        totalPaid: monthlyPayment * monthsToPayoff,
        extraPayment: remainingBudget > 0 ? remainingBudget : 0
      });
      
      remainingBudget = 0; // Only first loan gets extra payment in snowball
    });

    return { paymentPlan, totalMonths, totalInterest, strategy: 'snowball' };
  };

  const calculateHybridStrategy = (loans, extraBudget) => {
    // Hybrid: Split extra payment between highest interest and smallest balance
    const highestInterestLoan = [...loans].sort((a, b) => b.interestRate - a.interestRate)[0];
    const smallestBalanceLoan = [...loans].sort((a, b) => a.balance - b.balance)[0];
    
    let totalMonths = 0;
    let totalInterest = 0;
    const paymentPlan = [];

    loans.forEach(loan => {
      let extraPayment = 0;
      if (loan.id === highestInterestLoan.id) {
        extraPayment += extraBudget * 0.6; // 60% to highest interest
      }
      if (loan.id === smallestBalanceLoan.id && loan.id !== highestInterestLoan.id) {
        extraPayment += extraBudget * 0.4; // 40% to smallest balance
      }
      if (loan.id === highestInterestLoan.id && loan.id === smallestBalanceLoan.id) {
        extraPayment = extraBudget; // Same loan gets all extra payment
      }

      const monthlyPayment = loan.monthlyPayment + extraPayment;
      const monthsToPayoff = Math.ceil(loan.balance / monthlyPayment);
      const interestPaid = (monthlyPayment * monthsToPayoff) - loan.balance;
      
      totalMonths = Math.max(totalMonths, monthsToPayoff);
      totalInterest += interestPaid;
      
      paymentPlan.push({
        loanId: loan.id,
        loanName: loan.name,
        monthlyPayment,
        monthsToPayoff,
        interestPaid,
        totalPaid: monthlyPayment * monthsToPayoff,
        extraPayment
      });
    });

    return { paymentPlan, totalMonths, totalInterest, strategy: 'hybrid' };
  };

  useEffect(() => {
    if (loans.length > 0) {
      let results;
      switch (selectedStrategy) {
        case 'avalanche':
          results = calculateAvalancheStrategy(loans, extraBudget);
          break;
        case 'snowball':
          results = calculateSnowballStrategy(loans, extraBudget);
          break;
        case 'hybrid':
          results = calculateHybridStrategy(loans, extraBudget);
          break;
        default:
          results = calculateAvalancheStrategy(loans, extraBudget);
      }
      setOptimizationResults(results);
    }
  }, [loans, selectedStrategy, extraBudget]);

  const comparisonData = {
    avalanche: calculateAvalancheStrategy(loans, extraBudget),
    snowball: calculateSnowballStrategy(loans, extraBudget),
    hybrid: calculateHybridStrategy(loans, extraBudget)
  };

  const comparisonChartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>
                Total Interest: $${params[0].value.toLocaleString()}<br/>
                Payoff Time: ${params[1].value} months`;
      }
    },
    legend: {
      data: ['Total Interest', 'Payoff Time (months)']
    },
    xAxis: {
      type: 'category',
      data: ['Debt Avalanche', 'Debt Snowball', 'Hybrid Strategy']
    },
    yAxis: [
      {
        type: 'value',
        name: 'Total Interest ($)',
        position: 'left',
        axisLabel: {
          formatter: '${value:,.0f}'
        }
      },
      {
        type: 'value',
        name: 'Months',
        position: 'right',
        axisLabel: {
          formatter: '{value} mo'
        }
      }
    ],
    series: [
      {
        name: 'Total Interest',
        type: 'bar',
        yAxisIndex: 0,
        data: [
          comparisonData.avalanche.totalInterest,
          comparisonData.snowball.totalInterest,
          comparisonData.hybrid.totalInterest
        ],
        itemStyle: { color: '#ef4444' }
      },
      {
        name: 'Payoff Time (months)',
        type: 'line',
        yAxisIndex: 1,
        data: [
          comparisonData.avalanche.totalMonths,
          comparisonData.snowball.totalMonths,
          comparisonData.hybrid.totalMonths
        ],
        itemStyle: { color: '#0ea5e9' }
      }
    ]
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
            Optimization Strategies
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Find the best debt repayment strategy for your financial goals
          </p>
        </div>
      </div>

      {/* Strategy Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Choose Your Strategy
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {strategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedStrategy === strategy.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${strategy.bgColor}`}>
                  <SafeIcon icon={strategy.icon} className={`h-5 w-5 ${strategy.color}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    selectedStrategy === strategy.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {strategy.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {strategy.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Extra Monthly Budget ($)
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={extraBudget}
              onChange={(e) => setExtraBudget(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="w-24">
              <input
                type="number"
                value={extraBudget}
                onChange={(e) => setExtraBudget(parseInt(e.target.value) || 0)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {optimizationResults && (
        <>
          {/* Results Summary */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-3 bg-danger-50 rounded-lg">
                    <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-danger-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Total Interest Saved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${optimizationResults.totalInterest.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-3 bg-primary-50 rounded-lg">
                    <SafeIcon icon={FiClock} className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Debt-Free Timeline</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {optimizationResults.totalMonths} months
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
                  <p className="text-sm font-medium text-gray-500">Strategy Efficiency</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {selectedStrategy === 'avalanche' ? 'Optimal' : 
                     selectedStrategy === 'snowball' ? 'Motivational' : 'Balanced'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Plan */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Optimized Payment Plan
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extra Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payoff Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Interest
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {optimizationResults.paymentPlan.map((plan) => (
                    <tr key={plan.loanId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.loanName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${plan.monthlyPayment.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={plan.extraPayment > 0 ? 'text-success-600 font-medium' : 'text-gray-500'}>
                          ${plan.extraPayment.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.monthsToPayoff} months
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${plan.interestPaid.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Strategy Comparison */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Strategy Comparison
            </h3>
            <div className="h-64 mb-6">
              <ReactECharts option={comparisonChartOption} style={{ height: '100%', width: '100%' }} />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(comparisonData).map(([strategyKey, data]) => (
                <div key={strategyKey} className={`p-4 rounded-lg border-2 ${
                  selectedStrategy === strategyKey ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}>
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {strategyKey === 'avalanche' ? 'Debt Avalanche' : 
                     strategyKey === 'snowball' ? 'Debt Snowball' : 'Hybrid Strategy'}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Interest:</span>
                      <span className="font-medium">${data.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payoff Time:</span>
                      <span className="font-medium">{data.totalMonths} months</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default OptimizationStrategies;