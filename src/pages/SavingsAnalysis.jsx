import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import Card from '../components/ui/Card';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiPieChart, FiTrendingUp, FiDollarSign, FiCalendar, FiTarget, FiArrowDown } = FiIcons;

const SavingsAnalysis = () => {
  const { loans } = useLoan();
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('extra_payment');

  const scenarios = [
    {
      id: 'extra_payment',
      name: 'Extra Monthly Payment',
      description: 'Add $200-$1000 extra to monthly payments',
      icon: FiDollarSign
    },
    {
      id: 'refinance',
      name: 'Refinancing Options',
      description: 'Lower interest rates by 0.5%-2%',
      icon: FiTrendingUp
    },
    {
      id: 'consolidation',
      name: 'Debt Consolidation',
      description: 'Combine multiple debts into one',
      icon: FiTarget
    }
  ];

  const calculateSavingsScenarios = () => {
    if (!loans.length) return null;

    const baselineData = loans.map(loan => {
      const monthlyRate = loan.interestRate / 100 / 12;
      const totalPayments = loan.remainingTerm || 360;
      const totalInterest = (loan.monthlyPayment * totalPayments) - loan.balance;
      
      return {
        ...loan,
        totalInterest,
        totalPayments,
        totalPaid: loan.monthlyPayment * totalPayments
      };
    });

    // Extra Payment Scenarios
    const extraPaymentScenarios = [200, 500, 1000].map(extraAmount => {
      const results = baselineData.map(loan => {
        const newPayment = loan.monthlyPayment + (extraAmount / loans.length);
        const newTerm = Math.ceil(loan.balance / newPayment);
        const newTotalPaid = newPayment * newTerm;
        const newInterest = newTotalPaid - loan.balance;
        
        return {
          ...loan,
          extraPayment: extraAmount / loans.length,
          newMonthlyPayment: newPayment,
          newTerm,
          newTotalPaid,
          newInterest,
          interestSaved: loan.totalInterest - newInterest,
          timeSaved: (loan.totalPayments || 360) - newTerm
        };
      });

      const totalInterestSaved = results.reduce((sum, loan) => sum + loan.interestSaved, 0);
      const totalTimeSaved = Math.max(...results.map(loan => loan.timeSaved));

      return {
        extraAmount,
        loans: results,
        totalInterestSaved,
        totalTimeSaved
      };
    });

    // Refinance Scenarios
    const refinanceScenarios = [0.5, 1.0, 2.0].map(rateReduction => {
      const results = baselineData.map(loan => {
        const newRate = Math.max(0.1, loan.interestRate - rateReduction);
        const newMonthlyRate = newRate / 100 / 12;
        const remainingTerm = loan.remainingTerm || 360;
        
        let newPayment;
        if (newMonthlyRate === 0) {
          newPayment = loan.balance / remainingTerm;
        } else {
          newPayment = loan.balance * (newMonthlyRate * Math.pow(1 + newMonthlyRate, remainingTerm)) / 
                     (Math.pow(1 + newMonthlyRate, remainingTerm) - 1);
        }
        
        const newTotalPaid = newPayment * remainingTerm;
        const newInterest = newTotalPaid - loan.balance;
        
        return {
          ...loan,
          newRate,
          newMonthlyPayment: newPayment,
          newTotalPaid,
          newInterest,
          interestSaved: loan.totalInterest - newInterest,
          monthlySaved: loan.monthlyPayment - newPayment
        };
      });

      const totalInterestSaved = results.reduce((sum, loan) => sum + loan.interestSaved, 0);
      const totalMonthlySaved = results.reduce((sum, loan) => sum + loan.monthlySaved, 0);

      return {
        rateReduction,
        loans: results,
        totalInterestSaved,
        totalMonthlySaved
      };
    });

    return {
      baseline: baselineData,
      extraPayment: extraPaymentScenarios,
      refinance: refinanceScenarios
    };
  };

  useEffect(() => {
    const data = calculateSavingsScenarios();
    setAnalysisData(data);
  }, [loans]);

  if (!analysisData) {
    return <div>Loading analysis...</div>;
  }

  const savingsComparisonOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const scenario = params[0].name;
        return `${scenario}<br/>Interest Saved: $${params[0].value.toLocaleString()}`;
      }
    },
    xAxis: {
      type: 'category',
      data: analysisData.extraPayment.map(scenario => `+$${scenario.extraAmount}`)
    },
    yAxis: {
      type: 'value',
      name: 'Interest Saved ($)',
      axisLabel: {
        formatter: '${value:,.0f}'
      }
    },
    series: [
      {
        name: 'Interest Saved',
        type: 'bar',
        data: analysisData.extraPayment.map(scenario => scenario.totalInterestSaved),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#22c55e' },
              { offset: 1, color: '#16a34a' }
            ]
          }
        }
      }
    ]
  };

  const refinanceComparisonOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `Rate Reduction: ${params[0].name}<br/>
                Interest Saved: $${params[0].value.toLocaleString()}<br/>
                Monthly Saved: $${params[1].value.toLocaleString()}`;
      }
    },
    legend: {
      data: ['Interest Saved', 'Monthly Savings']
    },
    xAxis: {
      type: 'category',
      data: analysisData.refinance.map(scenario => `-${scenario.rateReduction}%`)
    },
    yAxis: [
      {
        type: 'value',
        name: 'Interest Saved ($)',
        position: 'left',
        axisLabel: {
          formatter: '${value:,.0f}'
        }
      },
      {
        type: 'value',
        name: 'Monthly Savings ($)',
        position: 'right',
        axisLabel: {
          formatter: '${value:,.0f}'
        }
      }
    ],
    series: [
      {
        name: 'Interest Saved',
        type: 'bar',
        yAxisIndex: 0,
        data: analysisData.refinance.map(scenario => scenario.totalInterestSaved),
        itemStyle: { color: '#0ea5e9' }
      },
      {
        name: 'Monthly Savings',
        type: 'line',
        yAxisIndex: 1,
        data: analysisData.refinance.map(scenario => scenario.totalMonthlySaved),
        itemStyle: { color: '#f59e0b' }
      }
    ]
  };

  const loanBreakdownOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ${c:,.0f} ({d}%)'
    },
    series: [
      {
        name: 'Current Interest Burden',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: analysisData.baseline.map(loan => ({
          value: loan.totalInterest,
          name: loan.name,
        }))
      }
    ],
    color: ['#ef4444', '#f59e0b', '#0ea5e9', '#22c55e', '#8b5cf6']
  };

  const bestExtraPaymentScenario = analysisData.extraPayment.reduce((best, current) => 
    current.totalInterestSaved > best.totalInterestSaved ? current : best
  );

  const bestRefinanceScenario = analysisData.refinance.reduce((best, current) => 
    current.totalInterestSaved > best.totalInterestSaved ? current : best
  );

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
            Savings Analysis
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Discover how much you can save with different repayment strategies
          </p>
        </div>
      </div>

      {/* Key Savings Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center p-3 bg-success-50 rounded-lg">
                <SafeIcon icon={FiArrowDown} className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Max Interest Savings</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${bestExtraPaymentScenario.totalInterestSaved.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-500">Time Saved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bestExtraPaymentScenario.totalTimeSaved} months
              </p>
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
              <p className="text-sm font-medium text-gray-500">Refinance Savings</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${bestRefinanceScenario.totalInterestSaved.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center p-3 bg-danger-50 rounded-lg">
                <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-danger-600" />
              </div>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Current Interest Burden</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${analysisData.baseline.reduce((sum, loan) => sum + loan.totalInterest, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scenario Selector */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Savings Scenarios
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedScenario === scenario.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center justify-center p-2 bg-primary-100 rounded-lg">
                    <SafeIcon icon={scenario.icon} className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    selectedScenario === scenario.id ? 'text-primary-900' : 'text-gray-900'
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Interest Distribution
          </h3>
          <div className="h-64">
            <ReactECharts option={loanBreakdownOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedScenario === 'extra_payment' ? 'Extra Payment Savings' : 
             selectedScenario === 'refinance' ? 'Refinance Savings' : 'Consolidation Analysis'}
          </h3>
          <div className="h-64">
            {selectedScenario === 'extra_payment' && (
              <ReactECharts option={savingsComparisonOption} style={{ height: '100%', width: '100%' }} />
            )}
            {selectedScenario === 'refinance' && (
              <ReactECharts option={refinanceComparisonOption} style={{ height: '100%', width: '100%' }} />
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Scenario Analysis */}
      {selectedScenario === 'extra_payment' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Extra Payment Scenario Details
          </h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {analysisData.extraPayment.map((scenario) => (
              <div key={scenario.extraAmount} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Extra ${scenario.extraAmount}/month
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Saved:</span>
                    <span className="font-medium text-success-600">
                      ${scenario.totalInterestSaved.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Saved:</span>
                    <span className="font-medium text-primary-600">
                      {scenario.totalTimeSaved} months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI:</span>
                    <span className="font-medium text-gray-900">
                      {((scenario.totalInterestSaved / (scenario.extraAmount * 12)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedScenario === 'refinance' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Refinancing Scenario Details
          </h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {analysisData.refinance.map((scenario) => (
              <div key={scenario.rateReduction} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">
                  -{scenario.rateReduction}% Interest Rate
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Saved:</span>
                    <span className="font-medium text-success-600">
                      ${scenario.totalInterestSaved.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Savings:</span>
                    <span className="font-medium text-primary-600">
                      ${scenario.totalMonthlySaved.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Savings:</span>
                    <span className="font-medium text-gray-900">
                      ${(scenario.totalMonthlySaved * 12).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Personalized Recommendations
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiTarget} className="h-6 w-6 text-success-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-success-900">Top Recommendation</h4>
                <p className="text-success-800 mt-1">
                  Add ${bestExtraPaymentScenario.extraAmount} extra per month to save ${bestExtraPaymentScenario.totalInterestSaved.toLocaleString()} in interest and pay off debt {bestExtraPaymentScenario.totalTimeSaved} months earlier.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-primary-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-primary-900">Refinancing Opportunity</h4>
                <p className="text-primary-800 mt-1">
                  Consider refinancing to reduce rates by {bestRefinanceScenario.rateReduction}%. This could save you ${bestRefinanceScenario.totalInterestSaved.toLocaleString()} in total interest over the life of your loans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SavingsAnalysis;