import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLoan } from '../context/LoanContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const { FiFileText, FiDownload, FiPrinter, FiMail, FiCalendar, FiTrendingUp, FiDollarSign, FiPieChart } = FiIcons;

const Reports = () => {
  const { loans, paymentHistory } = useLoan();
  const [selectedReport, setSelectedReport] = useState('summary');
  const [dateRange, setDateRange] = useState('ytd');
  const [isExporting, setIsExporting] = useState(false);

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
      formatter: function(params) {
        return `${params.name}: $${params.value.toLocaleString()} (${params.percent}%)`;
      }
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
          formatter: '{b}\n${c}'
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
        return `${params[0].name}<br/> Monthly Payment: $${params[0].value.toLocaleString()}<br/> Principal: $${params[1].value.toLocaleString()}<br/> Interest: $${params[2].value.toLocaleString()}`;
      }
    },
    legend: {
      data: ['Total Payment', 'Principal', 'Interest'],
      textStyle: {
        fontSize: 10
      },
      top: 5
    },
    xAxis: {
      type: 'category',
      data: loans.map(loan => loan.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value) {
          return '$' + value.toLocaleString();
        },
        fontSize: 10,
        margin: 10
      },
      nameTextStyle: {
        fontSize: 10,
        padding: [0, 0, 0, 40]
      }
    },
    series: [
      {
        name: 'Total Payment',
        type: 'bar',
        data: loans.map(loan => loan.monthlyPayment),
        itemStyle: {
          color: '#0ea5e9'
        },
        barWidth: '25%',
        barGap: '5%'
      },
      {
        name: 'Principal',
        type: 'bar',
        data: loans.map(loan => loan.monthlyPayment * 0.7), // Approximation
        itemStyle: {
          color: '#22c55e'
        },
        barWidth: '25%',
        barGap: '5%'
      },
      {
        name: 'Interest',
        type: 'bar',
        data: loans.map(loan => loan.monthlyPayment * 0.3), // Approximation
        itemStyle: {
          color: '#ef4444'
        },
        barWidth: '25%',
        barGap: '5%'
      }
    ],
    grid: {
      left: '12%',
      right: '8%',
      bottom: '22%',
      top: '18%',
      containLabel: true
    }
  };

  const generatePDFContent = () => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <!-- Page 1: Executive Summary -->
        <div class="pdf-page" style="page-break-after: always; padding: 40px; min-height: 700px;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px;">
            <h1 style="color: #0ea5e9; font-size: 28px; margin: 0;">KPCS Financial Portfolio Report</h1>
            <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <h2 style="color: #333; font-size: 24px; margin-bottom: 30px; border-left: 4px solid #0ea5e9; padding-left: 15px;">Executive Summary</h2>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #ef4444;">
              <h3 style="color: #ef4444; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0;">Total Debt</h3>
              <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0;">$${portfolioSummary.totalDebt.toLocaleString()}</p>
            </div>
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0ea5e9; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0;">Monthly Payments</h3>
              <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0;">$${portfolioSummary.totalMonthlyPayments.toLocaleString()}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #22c55e;">
              <h3 style="color: #22c55e; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0;">Repayment Progress</h3>
              <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0;">${portfolioSummary.totalProgress.toFixed(1)}%</p>
            </div>
            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #f59e0b; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0;">Average Interest Rate</h3>
              <p style="font-size: 32px; font-weight: bold; color: #333; margin: 0;">${portfolioSummary.averageInterestRate.toFixed(2)}%</p>
            </div>
          </div>

          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 30px;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 20px;">Portfolio Overview</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
              <div>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Total Loans:</strong> ${loans.length}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Active Loans:</strong> ${loans.filter(l => l.isActive).length}</p>
              </div>
              <div>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Interest Paid to Date:</strong> $${portfolioSummary.totalInterestPaid.toLocaleString()}</p>
                <p style="margin: 8px 0; font-size: 14px;"><strong>Original Amount:</strong> $${portfolioSummary.totalOriginal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Additional pages omitted for brevity -->
      </div>
    `;
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create worksheet with loan data
      const loanData = loans.map(loan => ({
        'Loan Name': loan.name,
        'Type': loan.type.replace('_', ' '),
        'Balance': loan.balance,
        'Original Amount': loan.originalAmount || loan.balance,
        'Interest Rate': loan.interestRate + '%',
        'Monthly Payment': loan.monthlyPayment,
        'Due Date': format(new Date(loan.dueDate), 'MM/dd/yyyy'),
        'Progress': loan.originalAmount ? `${(((loan.originalAmount - loan.balance) / loan.originalAmount) * 100).toFixed(1)}%` : '0%'
      }));
      const ws = XLSX.utils.json_to_sheet(loanData);

      // Add summary data
      const summaryData = [
        ['KPCS Portfolio Summary', ''],
        ['Total Loans', loans.length],
        ['Active Loans', loans.filter(l => l.isActive).length],
        ['Total Debt', `$${portfolioSummary.totalDebt.toLocaleString()}`],
        ['Monthly Payments', `$${portfolioSummary.totalMonthlyPayments.toLocaleString()}`],
        ['Average Interest Rate', `${portfolioSummary.averageInterestRate.toFixed(2)}%`],
        ['Repayment Progress', `${portfolioSummary.totalProgress.toFixed(1)}%`],
        ['Interest Paid to Date', `$${portfolioSummary.totalInterestPaid.toLocaleString()}`],
        ['Original Amount', `$${portfolioSummary.totalOriginal.toLocaleString()}`]
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

      // Add loan type breakdown
      const loanTypeData = [
        ['Loan Type Analysis', '', '', '', ''],
        ['Type', 'Count', 'Balance', 'Monthly Payment', 'Portfolio Share']
      ];
      Object.entries(portfolioSummary.loansByType).forEach(([type, data]) => {
        loanTypeData.push([
          type,
          data.count,
          `$${data.balance.toLocaleString()}`,
          `$${data.payment.toLocaleString()}`,
          `${((data.balance / portfolioSummary.totalDebt) * 100).toFixed(1)}%`
        ]);
      });
      const loanTypeWs = XLSX.utils.aoa_to_sheet(loanTypeData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Loan Portfolio');
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      XLSX.utils.book_append_sheet(wb, loanTypeWs, 'Loan Types');

      // Generate Excel file and use file-saver to download it
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const fileName = `KPCS_Financial_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Create a blob and save it using file-saver
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  const handleExport = async (format) => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      switch (format) {
        case 'pdf':
          const { jsPDF } = await import('jspdf');
          const { default: html2canvas } = await import('html2canvas');

          // Create PDF in portrait mode for better readability
          const doc = new jsPDF('portrait', 'mm', 'a4');

          // Create a temporary container for the PDF content
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = generatePDFContent();
          tempContainer.style.position = 'absolute';
          tempContainer.style.top = '-9999px';
          tempContainer.style.left = '-9999px';
          tempContainer.style.width = '210mm'; // A4 width
          tempContainer.style.background = 'white';
          document.body.appendChild(tempContainer);

          // Get all pages
          const pages = tempContainer.querySelectorAll('.pdf-page');
          for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
              doc.addPage(); // Add new page for each section
            }
            const page = pages[i];
            try {
              const canvas = await html2canvas(page, {
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 794, // A4 width in pixels at 96 DPI
                height: 1123 // A4 height in pixels at 96 DPI
              });

              const imgData = canvas.toDataURL('image/png');

              // Calculate dimensions to fit A4 page
              const pageWidth = 210; // A4 width in mm
              const pageHeight = 297; // A4 height in mm
              const margin = 0; // No margin since content is already padded
              const imgWidth = pageWidth;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;

              // Add image to PDF
              if (imgHeight <= pageHeight) {
                doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
              } else {
                // If content is taller than page, scale it to fit
                const scaledHeight = pageHeight;
                const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
                doc.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
              }
            } catch (error) {
              console.error('Error processing page', i + 1, ':', error);
            }
          }

          // Clean up
          document.body.removeChild(tempContainer);

          // Save the PDF
          doc.save(`KPCS_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
          break;

        case 'excel':
          exportToExcel();
          break;

        case 'print':
          // Create a print-friendly version
          const printWindow = window.open('', '_blank');
          const content = generatePDFContent();
          printWindow.document.write(`
            <html>
              <head>
                <title>KPCS Financial Portfolio Report</title>
                <style>
                  @media print {
                    .pdf-page {
                      page-break-after: always;
                    }
                    body {
                      margin: 0;
                    }
                  }
                  body {
                    font-family: Arial, sans-serif;
                  }
                </style>
              </head>
              <body>
                ${content}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 1000);
          break;

        case 'email':
          const subject = encodeURIComponent('KPCS Financial Portfolio Report');
          const body = encodeURIComponent(`Please find my comprehensive financial portfolio report summary:

EXECUTIVE SUMMARY
• Total Debt: $${portfolioSummary.totalDebt.toLocaleString()}
• Monthly Payments: $${portfolioSummary.totalMonthlyPayments.toLocaleString()}
• Average Interest Rate: ${portfolioSummary.averageInterestRate.toFixed(2)}%
• Repayment Progress: ${portfolioSummary.totalProgress.toFixed(1)}%

PORTFOLIO BREAKDOWN
${Object.entries(portfolioSummary.loansByType)
  .map(([type, data]) => `• ${type}: ${data.count} loans, $${data.balance.toLocaleString()} balance`)
  .join('\n')}

Generated on ${new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}

For detailed analysis and recommendations, please see the attached comprehensive report.`);
          window.location.href = `mailto:?subject=${subject}&body=${body}`;
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Error generating ${format}:`, error);
      alert(`Failed to generate ${format}. Please try again later.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 reports-content"
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            KPCS Financial Reports
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
              loading={isExporting}
              disabled={isExporting}
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
                  <SafeIcon
                    icon={report.icon}
                    className={`h-6 w-6 ${
                      selectedReport === report.id ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      selectedReport === report.id ? 'text-primary-900' : 'text-gray-900'
                    }`}
                  >
                    {report.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Debt Distribution by Type</h3>
              <div className="h-64">
                <ReactECharts
                  option={portfolioChartOption}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown by Loan</h3>
              <div className="h-64">
                <ReactECharts
                  option={paymentTrendOption}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </Card>
          </div>

          {/* Loan Details Table */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Portfolio Details</h3>
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
                    const progress = loan.originalAmount
                      ? ((loan.originalAmount - loan.balance) / loan.originalAmount) * 100
                      : 0;
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary by Loan Type</h3>
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
              {reportTypes.find((r) => r.id === selectedReport)?.name}
            </h3>
            <p className="text-gray-500">
              This report type is coming soon. Stay tuned for more detailed financial reporting
              features.
            </p>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default Reports;