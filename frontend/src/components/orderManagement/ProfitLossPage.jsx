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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-8 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Financial Report Generator</h1>
          </div>

          {/* Report Type Selection */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-2">
              <h2 className="font-medium text-gray-700">Report Type:</h2>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value="dateRange"
                    checked={reportType === 'dateRange'}
                    onChange={() => setReportType('dateRange')}
                    className="mr-2"
                  />
                  <span>Date Range</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value="monthYear"
                    checked={reportType === 'monthYear'}
                    onChange={() => setReportType('monthYear')}
                    className="mr-2"
                  />
                  <span>Month & Year</span>
                </label>
              </div>
            </div>
          </div>

          {/* Date Range Inputs */}
          {reportType === 'dateRange' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-200 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-200 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Month & Year Inputs */}
          {reportType === 'monthYear' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="block w-full rounded-md border border-gray-200 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Generate Report Button */}
          <div className="mt-4 mb-8">
            <button
              onClick={generateReport}
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>

          {/* Report Results */}
          {reportData && (
            <div className="mt-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">Profit/Loss Report</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {reportType === 'dateRange'
                      ? `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
                      : `Period: ${months.find(m => m.value === month)?.name} ${year}`}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                      <p className="text-2xl font-bold">{reportData.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={exportReport}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowDownToLine className="mr-2 h-4 w-4" />
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}