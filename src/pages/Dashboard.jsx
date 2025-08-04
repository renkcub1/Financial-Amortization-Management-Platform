import React,{useEffect} from 'react';
import {motion} from 'framer-motion';
import {useLoan} from '../context/LoanContext';
import {useAlert} from '../context/AlertContext';
import Card from '../components/ui/Card';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const {FiDollarSign,FiTrendingUp,FiTrendingDown,FiCreditCard,FiCalendar,FiAlertTriangle}=FiIcons;

const Dashboard=()=> {
  const {loans,getTotalDebt,getTotalMonthlyPayments}=useLoan();
  const {alerts,generatePaymentAlerts,addAlert}=useAlert();

  useEffect(()=> {
    const paymentAlerts=generatePaymentAlerts(loans);
    paymentAlerts.forEach(alert=> addAlert(alert));
  },[loans]);

  const totalDebt=getTotalDebt();
  const totalMonthlyPayments=getTotalMonthlyPayments();
  const activeLoans=loans.filter(loan=> loan.isActive).length;
  const averageInterestRate=loans.length > 0 
    ? loans.reduce((sum,loan)=> sum + loan.interestRate,0) / loans.length 
    : 0;

  const debtByTypeData=loans.reduce((acc,loan)=> {
    const type=loan.type.replace('_',' ').toUpperCase();
    acc[type]=(acc[type] || 0) + loan.balance;
    return acc;
  },{});

  const pieChartOption={
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ${c:,.0f} ({d}%)'
    },
    series: [
      {
        name: 'Debt Distribution',
        type: 'pie',
        radius: ['40%','70%'],
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
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(debtByTypeData).map(([type,amount])=> ({
          value: amount,
          name: type,
        }))
      }
    ],
    color: ['#0ea5e9','#22c55e','#f59e0b','#ef4444','#8b5cf6']
  };

  const paymentTrendData=loans.map((loan,index)=> ({
    name: loan.name,
    value: loan.monthlyPayment,
    itemStyle: {
      color: ['#0ea5e9','#22c55e','#f59e0b','#ef4444'][index % 4]
    }
  }));

  const barChartOption={
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].name}: $${params[0].value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
      }
    },
    xAxis: {
      type: 'category',
      data: loans.map(loan=> loan.name),
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return '$' + value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          });
        }
      }
    },
    series: [
      {
        name: 'Monthly Payment',
        type: 'bar',
        data: paymentTrendData,
        itemStyle: {
          borderRadius: [4,4,0,0]
        }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  };

  const stats=[
    {
      name: 'Total Debt',
      value: `$${totalDebt.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
      change: '-2.3%',
      changeType: 'decrease'
    },
    {
      name: 'Monthly Payments',
      value: `$${totalMonthlyPayments.toLocaleString()}`,
      icon: FiCalendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      change: '+1.2%',
      changeType: 'increase'
    },
    {
      name: 'Active Loans',
      value: activeLoans,
      icon: FiCreditCard,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      change: '0',
      changeType: 'neutral'
    },
    {
      name: 'Avg Interest Rate',
      value: `${averageInterestRate.toFixed(2)}%`,
      icon: FiTrendingUp,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      change: '-0.5%',
      changeType: 'decrease'
    }
  ];

  const upcomingPayments=loans
    .filter(loan=> loan.isActive)
    .sort((a,b)=> new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0,5);

  const recentAlerts=alerts.slice(0,3);

  return (
    <motion.div
      initial={{opacity: 0,y: 20}}
      animate={{opacity: 1,y: 0}}
      transition={{duration: 0.5}}
      className="space-y-6"
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Financial Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your loan portfolio and payment schedule
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat,index)=> (
          <motion.div
            key={stat.name}
            initial={{opacity: 0,y: 20}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.5,delay: index * 0.1}}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-3 ${stat.bgColor} rounded-lg`}>
                    <SafeIcon icon={stat.icon} className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      {stat.change !=='0' && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType==='increase' ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          <SafeIcon 
                            icon={stat.changeType==='increase' ? FiTrendingUp : FiTrendingDown} 
                            className="h-4 w-4 mr-1" 
                          />
                          {stat.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Debt Distribution by Type
          </h3>
          <div className="h-64">
            <ReactECharts 
              option={pieChartOption} 
              style={{height: '100%',width: '100%'}} 
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Payments by Loan
          </h3>
          <div className="h-64">
            <ReactECharts 
              option={barChartOption} 
              style={{height: '100%',width: '100%'}} 
            />
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Payments
            </h3>
            <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingPayments.map((loan)=> (
              <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{loan.name}</p>
                  <p className="text-sm text-gray-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${loan.monthlyPayment.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{loan.type.replace('_',' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Alerts
            </h3>
            <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert)=> (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity==='high' 
                      ? 'border-danger-500 bg-danger-50' 
                      : alert.severity==='medium' 
                        ? 'border-warning-500 bg-warning-50' 
                        : 'border-primary-500 bg-primary-50'
                  }`}
                >
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent alerts</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;