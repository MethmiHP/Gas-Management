 import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowLeft, FileDown, Loader } from "lucide-react";

const DriverPerformanceReport = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [incrementRate, setIncrementRate] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month || !year || !incrementRate) {
      setError("Month, year, and increment rate are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/deliveries/performance-report", {
        params: { month, year, incrementRate },
      });
      setReport(response.data.report);
    } catch (error) {
      setError("Failed to fetch driver performance report.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    // Add Nelson Enterprises header
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102); // Dark blue color
    doc.text("Nelson Enterprises", 105, 15, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("Driver Performance Report", 105, 25, { align: "center" });
    
    // Add report metadata
    doc.setFontSize(10);
    doc.text(`Month: ${month}`, 20, 35);
    doc.text(`Year: ${year}`, 20, 40);
    doc.text(`Increment Rate: ${incrementRate}%`, 20, 45);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
    
    const tableColumn = ["Driver ID", "Driver Name", "Completed Deliveries", "Salary Increment"];
    const tableRows = report.map(entry => [
      entry.driver._id,
      entry.driver.name,
      entry.completedDeliveries,
      `${entry.salaryIncrement}%`
    ]);
    
    autoTable(doc, { 
      head: [tableColumn], 
      body: tableRows, 
      startY: 55,
      headStyles: { fillColor: [0, 51, 102] } // Match Nelson Enterprises blue
    });
    
    doc.save(`Nelson_Enterprises_Driver_Performance_Report_${month}_${year}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* <h1 className="text-xl font-bold">Driver Performance Report</h1> */}
            <button 
              onClick={() => navigate("/")}
              className="flex items-center text-sm hover:text-blue-300 transition duration-300"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-800 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Generate Performance Report</h2>
            <p className="text-sm text-blue-200">Select month, year and increment rate to generate the report</p>
          </div>
          
          {/* Form Body */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <input 
                    type="number" 
                    min="1"
                    max="12"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="1-12" 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="e.g., 2025" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Increment Rate (%)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="e.g., 5" 
                    value={incrementRate} 
                    onChange={(e) => setIncrementRate(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center transition duration-300" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => navigate("/")} 
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md font-medium transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Report Results */}
            {report.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Performance Results</h3>
                  <button 
                    onClick={generatePDF} 
                    className="flex items-center text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-300"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDF
                  </button>
                </div>
                
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Driver ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Driver Name</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Completed Deliveries</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Salary Increment (%)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.map((entry, index) => (
                        <tr 
                          key={entry.driver._id} 
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{entry.driver._id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{entry.driver.name}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">{entry.completedDeliveries}</td>
                          <td className="px-4 py-3 text-sm text-center font-medium text-blue-600">{entry.salaryIncrement}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
                  <p>Report generated for {month}/{year} with {incrementRate}% increment rate. Found {report.length} driver(s).</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPerformanceReport;