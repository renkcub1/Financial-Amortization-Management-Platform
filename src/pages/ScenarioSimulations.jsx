import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiSettings, FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar, FiRefreshCw, FiTarget } = FiIcons;

const ScenarioSimulations = () => {
  const { loans } = useLoan();
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState('current');
  const [simulationInputs, setSimulationInputs] = useState({
    interestRateChange: 0,
    extraPayment: 0,
    refinanceRate: 0,
    consolidationRate: 0,
    inflationRate: 2.5,
    incomeChange: 0
  });

  const scenarioTypes = [
    {
      id: 'current',
      name: 'Current Situation',
      description: 'Your current loan portfolio as-is',
      icon: FiTarget,
      color: 'text-gray-600'
    },
    {
      id: 'rate_increase',
      name: 'Interest Rate Increase',
      description: 'What if rates go up by 1-3%?',
      icon: FiTrendingUp,
      color: 'text-danger-600'
    },
    {
      id: 'rate_decrease',
      name: 'Interest Rate Decrease',
      description: 'What if rates go down by 0.5-2%?',
      icon: FiTrendingDown,
      color: 'text-success-600'
    },
    {
      id: 'extra_payments',
      name: 'Extra Payments',
      description: 'Impact of additional monthly payments',
      icon: FiDollarSign,
      color: 'text-primary-600'
    },
    {
      id: 'refinance',
      name: 'Refinancing',
      description: 'Benefits of refinancing at lower rates',
      icon: FiRefreshCw,
      color: 'text-warning-600'
    },
    {
      id: 'economic_stress',
      name: 'Economic Stress Test',
      description: 'Multiple adverse conditions combined',
      icon: FiSettings,
      color: 'text-purple-600'
    }
  ];

  const calculateScenario = (scenarioType, inputs) => {
    const results = loans.map(loan => {
      let newRate = loan.interestRate;
      let newPayment = loan.monthlyPayment;
      let extraPayment = 0;

      switch (scenarioType) {
        case 'rate_increase':
          newRate = loan.interestRate + inputs.interestRateChange;
          break;
        case 'rate_decrease':
          newRate = Math.max(0.1, loan.interestRate - Math.abs(inputs.interestRateChange));
          break;
        case 'extra_payments':
          extraPayment = inputs.extraPayment / loans.length;
          break;
        case 'refinance':
          newRate = inputs.refinanceRate || (loan.interestRate - 1);
          break;
        case 'economic_stress':
          newRate = loan.interestRate + 2; // Stress test: +2% rates
          newPayment = loan.monthlyPayment * 0.9; // 10% income reduction
          break;
        default:
          break;
      }

      const monthlyRate = newRate / 100 / 12;
      const remainingTerm = loan.remainingTerm || 360;
      
      let calculatedPayment;
      if (scenarioType === 'current') {
        calculatedPayment = loan.monthlyPayment;
      } else if (monthlyRate === 0) {
        calculatedPayment = loan.balance / remainingTerm;
      } else {
        calculatedPayment = loan.balance * (monthlyRate * Math.pow(1 + monthlyRate, remainingTerm)) / 
                          (Math.pow(1 + monthlyRate, remainingTerm) - 1);
      }

      const totalPayment = calculatedPayment + extraPayment;
      const monthsToPayoff = Math.ceil(loan.balance / totalPayment);
      const totalPaid = totalPayment * monthsToPayoff;
      const totalInterest = totalPaid - loan.balance;

      return {
        ...loan,
        scenarioType,
        newRate,
        newPayment: calculatedPayment,
        extraPayment,
        totalPayment,
        monthsToPayoff,
        totalPaid,
        totalInterest,
        monthlySavings: loan.monthlyPayment - calculatedPayment,
        interestSavings: (loan.monthlyPayment * (loan.remainingTerm || 360) - loan.balance) - totalInterest
      };
    });

    const totalInterest = results.reduce((sum, loan) => sum + loan.totalInterest, 0);
    const totalMonthlyPayment = results.reduce((sum, loan) => sum + loan.totalPayment, 0);
    const maxPayoffTime = Math.max(...results.map(loan => loan.monthsToPayoff));
    const totalInterestSavings = results.reduce((sum, loan) => sum + loan.interestSavings, 0);

    return {
      type: scenarioType,
      loans: results,
      summary: {
        totalInterest,
        totalMonthlyPayment,
        maxPayoffTime,
        totalInterestSavings
      }
    };
  };

  useEffect(() => {
    if (loans.length > 0) {
      const scenarioResults = scenarioTypes.map(scenario => {
        let inputs = { ...simulationInputs };
        
        // Set default values for different scenarios
        switch (scenario.id) {
          case 'rate_increase':
            inputs.interestRateChange = 2;
            break;
          case 'rate_decrease':
            inputs.interestRateChange = 1;
            break;
          case 'extra_payments':
            inputs.extraPayment = 500;
            break;
          case 'refinance':
            inputs.refinanceRate = Math.max(...loans.map(l => l.interestRate)) - 1.5;
            break;
          default:
            break;
        }
        
        return calculateScenario(scenario.id, inputs);
      });
      
      setScenarios(scenarioResults);
    }
  }, [loans, simulationInputs]);

  const currentScenario = scenarios.find(s => s.type === activeScenario);
  const baselineScenario = scenarios.find(s => s.type === 'current');

  const comparisonChartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}<br/>
                Total Interest: $${params[0].value.toLocaleString()}<br/>
                Monthly Payment: $${params[1].value.toLocaleString()}<br/>
                Payoff Time: ${params[2].value} months`;
      }
    },
    legend: {
      data: ['Total Interest', 'Monthly Payment', 'Payoff Time']
    },
    xAxis: {
      type: 'category',
      data: scenarios.map(s => scenarioTypes.find(st => st.id === s.type)?.name || s.type),
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Amount ($)',
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
        data: scenarios.map(s => s.summary.totalInterest),
        itemStyle: { color: '#ef4444' }
      },
      {
        name: 'Monthly Payment',
        type: 'bar',
        yAxisIndex: 0,
        data: scenarios.map(s => s.summary.totalMonthlyPayment),
        itemStyle: { color: '#0ea5e9' }
      },
      {
        name: 'Payoff Time',
        type: 'line',
        yAxisIndex: 1,
        data: scenarios.map(s => s.summary.maxPayoffTime),
        itemStyle: { color: '#22c55e' }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    }
  };

  const timelineChartOption = currentScenario ? {
    tooltip: {
      trigger: 'axis',
      formatter: 'Month {b}: ${c:,.0f}'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 60 }, (_, i) => i + 1), // First 5 years
      name: 'Month'
    },
    yAxis: {
      type: 'value',
      name: 'Remaining Balance ($)',
      axisLabel: {
        formatter: '${value:,.0f}'
      }
    },
    series: currentScenario.loans.map((loan, index) => ({
      name: loan.name,
      type: 'line',
      data: Array.from({ length: Math.min(60, loan.monthsToPayoff) }, (_, month) => {
        const remaining = Math.max(0, loan.balance - (loan.totalPayment * (month + 1)));
        return remaining;
      }),
      itemStyle: { color: ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] }
    }))
  } : {};

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
            Scenario Simulations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Model different financial scenarios and their impact on your debt repayment
          </p>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Scenario</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarioTypes.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(scenario.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeScenario === scenario.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <SafeIcon icon={scenario.icon} className={`h-6 w-6 ${scenario.color}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    activeScenario === scenario.id ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {scenario.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {scenario.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Simulation Controls */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interest Rate Change (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={simulationInputs.interestRateChange}
              onChange={(e) => setSimulationInputs({
                ...simulationInputs,
                interestRateChange: parseFloat(e.target.value) || 0
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Extra Monthly Payment ($)
            </label>
            <input
              type="number"
              value={simulationInputs.extraPayment}
              onChange={(e) => setSimulationInputs({
                ...simulationInputs,
                extraPayment: parseFloat(e.target.value) || 0
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Refinance Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={simulationInputs.refinanceRate}
              onChange={(e) => setSimulationInputs({
                ...simulationInputs,
                refinanceRate: parseFloat(e.target.value) || 0
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Scenario Results */}
      {currentScenario && baselineScenario && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center p-3 bg-danger-50 rounded-lg">
                  <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-danger-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Interest</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${currentScenario.summary.totalInterest.toLocaleString()}
                </p>
                {currentScenario.type !== 'current' && (
                  <p className={`text-sm ${
                    currentScenario.summary.totalInterest < baselineScenario.summary.totalInterest
                      ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {currentScenario.summary.totalInterest < baselineScenario.summary.totalInterest ? '↓' : '↑'}
                    ${Math.abs(currentScenario.summary.totalInterest - baselineScenario.summary.totalInterest).toLocaleString()}
                  </p>
                )}
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
                <p className="text-sm font-medium text-gray-500">Monthly Payment</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${currentScenario.summary.totalMonthlyPayment.toLocaleString()}
                </p>
                {currentScenario.type !== 'current' && (
                  <p className={`text-sm ${
                    currentScenario.summary.totalMonthlyPayment < baselineScenario.summary.totalMonthlyPayment
                      ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {currentScenario.summary.totalMonthlyPayment < baselineScenario.summary.totalMonthlyPayment ? '↓' : '↑'}
                    ${Math.abs(currentScenario.summary.totalMonthlyPayment - baselineScenario.summary.totalMonthlyPayment).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center p-3 bg-warning-50 rounded-lg">
                  <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-warning-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Payoff Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {currentScenario.summary.maxPayoffTime} mo
                </p>
                {currentScenario.type !== 'current' && (
                  <p className={`text-sm ${
                    currentScenario.summary.maxPayoffTime < baselineScenario.summary.maxPayoffTime
                      ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {currentScenario.summary.maxPayoffTime < baselineScenario.summary.maxPayoffTime ? '↓' : '↑'}
                    {Math.abs(currentScenario.summary.maxPayoffTime - baselineScenario.summary.maxPayoffTime)} mo
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center p-3 bg-success-50 rounded-lg">
                  <SafeIcon icon={FiTarget} className="h-6 w-6 text-success-600" />
                </div>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Interest Savings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${currentScenario.summary.totalInterestSavings.toLocaleString()}
                </p>
                <p className={`text-sm ${
                  currentScenario.summary.totalInterestSavings > 0 ? 'text-success-600' : 'text-gray-500'
                }`}>
                  vs. current plan
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Scenario Comparison
          </h3>
          <div className="h-64">
            <ReactECharts option={comparisonChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Balance Timeline - {scenarioTypes.find(s => s.id === activeScenario)?.name}
          </h3>
          <div className="h-64">
            <ReactECharts option={timelineChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>
      </div>

      {/* Detailed Results */}
      {currentScenario && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Scenario Results
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payoff Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentScenario.loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {loan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.newRate.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${loan.totalPayment.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.monthsToPayoff} months
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${loan.totalInterest.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={loan.interestSavings > 0 ? 'text-success-600' : 'text-danger-600'}>
                        ${loan.interestSavings.toFixed(2)}
                      </span>
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

export default ScenarioSimulations;