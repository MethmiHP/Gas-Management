import { useState } from 'react';
import { Calendar, ArrowDownToLine, BarChart3, Loader2 } from 'lucide-react';

export default function FinanceReportGenerator() {
  // State variables
  const [reportType, setReportType] = useState('dateRange'); // 'dateRange' or 'monthYear'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to generate report
  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      let queryParams = '';
      
      if (reportType === 'dateRange') {
        if (!startDate || !endDate) {
          throw new Error('Please select both start and end dates');
        }
        queryParams = `startDate=${startDate}&endDate=${endDate}`;
      } else {
        if (!month || !year) {
          throw new Error('Please select both month and year');
        }
        queryParams = `month=${month}&year=${year}`;
      }
      
      console.log('Sending request to:', `http://localhost:5000/api/profit-loss?${queryParams}`);
      
      // If using Vite proxy (recommended), use this:
      // const response = await fetch(`/api/profit-loss?${queryParams}`, {
      //   method: 'GET',
      //   headers: {
      //     'Accept': 'application/json'
      //   }
      // });
      
      // If using direct call (requires CORS setup), use this:
      const response = await fetch(`http://localhost:5000/api/profit-loss?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log('Response status:', response.status);
      
      // Get response text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid JSON. Check backend routes and CORS configuration.');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate report');
      }
      
      setReportData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to export report as CSV
  const exportReport = () => {
    if (!reportData) return;

    let reportTitle = reportType === 'dateRange' 
      ? `Finance_Report_${startDate}_to_${endDate}` 
      : `Finance_Report_${month}_${year}`;
    
    const csvContent = `
Report: Profit/Loss Summary
Period: ${reportType === 'dateRange' ? `${startDate} to ${endDate}` : `${month}/${year}`}
Total Orders: ${reportData.totalOrders}
Total Revenue: $${reportData.totalRevenue.toFixed(2)}
Generated on: ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get years for dropdown (current year and 10 years back)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i);

  // Get month names for dropdown
  const months = [
    { value: '1', name: 'January' },
    { value: '2', name: 'February' },
    { value: '3', name: 'March' },
    { value: '4', name: 'April' },
    { value: '5', name: 'May' },
    { value: '6', name: 'June' },
    { value: '7', name: 'July' },
    { value: '8', name: 'August' },
    { value: '9', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Financial Report Generator</h1>
                <p className="mt-2 text-blue-100">Generate detailed profit and loss reports for your business</p>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {/* Report Type Selection */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Report Type</h2>
              <div className="flex space-x-6">
                <label className="relative flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="reportType"
                    value="dateRange"
                    checked={reportType === 'dateRange'}
                    onChange={() => setReportType('dateRange')}
                    className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Date Range</span>
                </label>
                <label className="relative flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="reportType"
                    value="monthYear"
                    checked={reportType === 'monthYear'}
                    onChange={() => setReportType('monthYear')}
                    className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Month & Year</span>
                </label>
              </div>
            </div>

            {/* Date Range Inputs */}
            {reportType === 'dateRange' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Month & Year Inputs */}
            {reportType === 'monthYear' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select Year</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Report Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={generateReport}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>

            {/* Report Results */}
            {reportData && (
              <div className="mt-8 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Financial Report Summary</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {reportType === 'dateRange'
                      ? `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                      : `Period: ${months.find(m => m.value === month)?.name} ${year}`}
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-500 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-gray-900">{reportData.totalOrders}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-500 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-gray-900">LKR {reportData.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={exportReport}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}