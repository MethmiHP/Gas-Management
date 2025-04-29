import React, { useEffect, useState, useRef } from 'react';
import { ProductService } from '../services/product.services';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartJSToImage from 'chartjs-to-image';

// Register plugins
Chart.register(ChartDataLabels);

const ProductAnalyticsReport = () => {
  // State for all analytics data
  const [products, setProducts] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({ byType: [], byGasType: [], bySize: [] });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockThreshold, setStockThreshold] = useState(10);

  const typeChartRef = useRef(null);
  const chartInstances = useRef({});

  // Fetch all required data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(''); // Reset error on new fetch
    try {
      const [productsRes, statsRes, lowStockRes] = await Promise.all([
        ProductService.getProducts(),
        ProductService.getInventoryStats(),
        ProductService.getLowInventory(stockThreshold)
      ]);
      
      console.log("Raw response from /stats/inventory:", statsRes);
      
      setProducts(productsRes?.data || []);
      
      if (statsRes?.data && statsRes.data.byType) {
           setInventoryStats(statsRes.data);
           console.log("Successfully updated inventoryStats state:", statsRes.data);
      } else {
           console.warn("/stats/inventory response structure might be unexpected or empty:", statsRes);
           setInventoryStats({ byType: [], byGasType: [], bySize: [] });
      }

      setLowStockProducts(lowStockRes?.data?.all || []);
      
    } catch (err) {
      console.error("Error in fetchAllData:", err); // Log the actual error
      setError(err.message || 'Failed to fetch analytics data');
      toast.error('Failed to fetch analytics data: ' + err.message);
      // Ensure state is reset on error
      setProducts([]);
      setInventoryStats({ byType: [], byGasType: [], bySize: [] });
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Analytics Calculations ---
  // Product Overview Analytics
  const totalProductCount = products.length;
  const productTypeDist = inventoryStats.byType;
  const gasTypeDist = inventoryStats.byGasType;
  const lpgSizeDist = inventoryStats.bySize;

  // Inventory Analytics
  const totalQtyByType = productTypeDist.map(t => ({ type: t._id, total: t.totalQuantity }));
  const totalQtyByGasType = gasTypeDist.map(g => ({ gasType: g._id, total: g.totalQuantity }));
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  // Financial Analytics
  const totalRevenueByType = productTypeDist.map(t => ({
    type: t._id,
    revenue: products.filter(p => p.type === t._id).reduce((sum, p) => sum + (p.price * p.quantity), 0)
  }));
  const totalRevenueByGasType = gasTypeDist.map(g => ({
    gasType: g._id,
    revenue: products.filter(p => p.gasType === g._id).reduce((sum, p) => sum + (p.price * p.quantity), 0)
  }));
  const avgProductPrice = products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0;
  // For time period revenue, you would filter by createdAt/updatedAt

  // Sales Trend Analytics (requires sales/order data, here we use product updates as a proxy)
  // Most Sold/Profitable Products
  const mostSoldProducts = [...products].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const mostProfitableProducts = [...products].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity)).slice(0, 5);
  // Product update frequency (count updates per product)

  // Product Category Analytics
  // ...
  // Stock Movement and Trends
  // ...

  // Render charts locally when data changes
  useEffect(() => {
    // Clean up previous charts
    Object.values(chartInstances.current).forEach(chart => chart && chart.destroy());
    chartInstances.current = {};

    // Product Type Chart (Percentage Pie)
    if (typeChartRef.current && productTypeDist && productTypeDist.length > 0) {
      const totalCount = productTypeDist.reduce((sum, t) => sum + t.count, 0);
      const labels = productTypeDist.map(t => t._id);
      const data = productTypeDist.map(t => t.count);

      chartInstances.current.type = new Chart(typeChartRef.current, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)', // Blue for Gas Cylinder?
              'rgba(153, 102, 255, 0.8)'  // Purple for Accessory?
            ],
            borderColor: [
               'rgba(54, 162, 235, 1)',
               'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            title: { 
              display: true, 
              text: 'Product Distribution: Gas Cylinders vs. Accessories', 
              font: { size: 16 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  const value = context.raw || 0;
                  const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) : 0;
                  label += `${value} units (${percentage}%)`;
                  return label;
                }
              }
            },
            datalabels: { // Optional: Show percentage directly on slices
              formatter: (value, ctx) => {
                const percentage = totalCount > 0 ? ((value / totalCount) * 100).toFixed(1) + '%' : '0%';
                return percentage;
              },
              color: '#fff',
              font: {
                  weight: 'bold'
              }
            }
          }
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      Object.values(chartInstances.current).forEach(chart => chart && chart.destroy());
      chartInstances.current = {};
    };
  }, [inventoryStats]);

  // --- Report Generation (PDF) ---
  const generatePDFReport = async () => {
    // Ensure chart is rendered before attempting capture
    if (!typeChartRef.current) {
      toast.error("Chart not ready yet, please wait a moment and try again.");
      return;
    }

    // --- DEBUGGING: Log the data we have ---
    console.log("Data for PDF Report:");
    console.log("Products:", products);
    console.log("Inventory Stats:", inventoryStats);
    console.log("Product Type Dist:", productTypeDist);
    console.log("Gas Type Dist:", gasTypeDist);
    console.log("LPG Size Dist:", lpgSizeDist);
    console.log("Low Stock Products:", lowStockProducts);
    console.log("Out of Stock Products:", outOfStockProducts);
    // --- END DEBUGGING ---

    try {
      toast.info('Generating professional report...', { autoClose: 3500 });
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      let y = 15; // Initial Y position

      // --- Title ---
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 52, 110); // Dark blue
      doc.text('Product Inventory & Analytics Report', pageWidth / 2, y, { align: 'center' });
      y += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
      y += 10;
      doc.setLineWidth(0.5);
      doc.setDrawColor(200);
      doc.line(15, y, pageWidth - 15, y);
      y += 10;

      // --- Executive Summary ---
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 52, 110);
      doc.text('Executive Summary', 15, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(50);
      doc.text(`• Total Unique Products: ${totalProductCount}`, 20, y); y += 6;
      doc.text(`• Total Units in Stock: ${products.reduce((sum, p) => sum + p.quantity, 0)}`, 20, y); y += 6;
      doc.text(`• Total Inventory Value: LKR ${products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}`, 20, y); y += 6;
      doc.text(`• Average Product Price: LKR ${avgProductPrice.toFixed(2)}`, 20, y); y += 6;
      doc.text(`• Products Low on Stock (<= ${stockThreshold}): ${lowStockProducts.length}`, 20, y); y += 6;
      doc.text(`• Products Out of Stock: ${outOfStockProducts.length}`, 20, y); y += 8;

      // --- Chart Section (Single Pie Chart) ---
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 52, 110);
      doc.text('Product Type Distribution (%)', 15, y);
      y += 7;
      const chartStartY = y;
      const chartHeight = 70; // Make it larger
      const chartWidth = 90; // Make it larger
      const chartX = (pageWidth - chartWidth) / 2; // Center the chart
      let chartAdded = false;

      try {
        // Chart 1: Product Type Percentage Pie
        if (productTypeDist && productTypeDist.length > 0 && chartInstances.current.type) {
          // Add a small delay to ensure rendering is complete before capturing
          await new Promise(resolve => setTimeout(resolve, 100)); 
          const imgData = typeChartRef.current.toDataURL('image/png', 1.0);
          if (imgData && imgData.length > 'data:image/png;base64,'.length) {
            doc.addImage(imgData, 'PNG', chartX, chartStartY, chartWidth, chartHeight);
            chartAdded = true;
          } else { 
             doc.text('Error generating chart image', chartX + chartWidth/2, chartStartY + chartHeight/2, { align: 'center' });
          }
        } else {
           doc.text('No data available for Product Type chart.', chartX + chartWidth/2, chartStartY + chartHeight/2, { align: 'center' });
        }
      } catch (err) {
        console.error("Error adding chart to PDF:", err);
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.text('Error occurred while rendering chart into PDF.', 15, y + chartHeight / 2);
        chartAdded = false; // Ensure we mark as not added on error
      }
      y = chartStartY + (chartAdded ? chartHeight : 15) + 15; // Adjust Y position below the chart area

      // --- Helper function for adding tables and page breaks ---
      const addTable = (title, head, body, startY, theme = 'grid', headFill = [40, 52, 110]) => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 52, 110);
        doc.text(title, 15, startY);
        startY += 7;
        
        autoTable(doc, {
          startY: startY,
          head: head,
          body: body,
          theme: theme,
          headStyles: { fillColor: headFill, textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 2 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 15, right: 15 },
          didDrawPage: (data) => {
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
              'Gas Management System - Product Report',
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
            doc.text(
              `Page ${doc.internal.getNumberOfPages()}`,
              pageWidth - 15,
              pageHeight - 10,
              { align: 'right' }
            );
          }
        });
        return doc.lastAutoTable.finalY + 10; // Return Y position after table
      };

      // --- Detailed Tables (Conditional Rendering) ---
      doc.addPage(); // Start tables on a new page
      y = 20;

      if (productTypeDist && productTypeDist.length > 0) {
        y = addTable('Product Overview by Type (Counts)', [['Type', 'Count', 'Total Quantity']], productTypeDist.map(t => [t._id, t.count, t.totalQuantity]), y, 'striped', [54, 162, 235]);
      }
      
      if (totalRevenueByType && totalRevenueByType.length > 0) {
          if (y + 30 > pageHeight) { doc.addPage(); y = 20; }
          y = addTable('Financial Overview by Type', [['Type', 'Total Revenue']], totalRevenueByType.map(t => [t.type, `LKR ${t.revenue.toFixed(2)}`]), y, 'grid', [153, 102, 255]);
      }
      
      if (mostSoldProducts && mostSoldProducts.length > 0) {
          if (y + 40 > pageHeight) { doc.addPage(); y = 20; }
          y = addTable('Top 5 Most Stocked Products', [['Product Name', 'Quantity']], mostSoldProducts.map(p => [p.name, p.quantity]), y, 'plain', [80, 80, 80]);
      }
      
      if (mostProfitableProducts && mostProfitableProducts.length > 0) {
          if (y + 40 > pageHeight) { doc.addPage(); y = 20; }
          y = addTable('Top 5 Most Profitable Products', [['Product Name', 'Total Value']], mostProfitableProducts.map(p => [p.name, `LKR ${(p.price * p.quantity).toFixed(2)}`]), y, 'plain', [80, 80, 80]);
      }
      
      if (lowStockProducts && lowStockProducts.length > 0) {
          if (y + 50 > pageHeight) { doc.addPage(); y = 20; }
          y = addTable(`Low Stock Products (<= ${stockThreshold} Units)`, [['Product Name', 'Type', 'Gas Type', 'Size', 'Stock']], lowStockProducts.map(p => [p.name, p.type, p.gasType || '-', p.size || '-', p.quantity]), y, 'grid', [231, 76, 60]);
      }
      
      if (outOfStockProducts && outOfStockProducts.length > 0) {
          if (y + 50 > pageHeight) { doc.addPage(); y = 20; }
          y = addTable('Out of Stock Products', [['Product Name', 'Type', 'Gas Type', 'Size']], outOfStockProducts.map(p => [p.name, p.type, p.gasType || '-', p.size || '-']), y, 'grid', [200, 0, 0]);
      }

      // Final adjustments to remove blank last page if created unnecessarily
      if (doc.lastAutoTable && doc.lastAutoTable.finalY < 50 && doc.internal.getNumberOfPages() > 1) {
           // Check if the last table finished very early on the last page
           // This condition might need adjustment based on your content
      }

      // Save the PDF
      doc.save(`Product_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Professional product report generated!');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    }
  };

  // --- Render ---
  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Product Analytics Report</h2>
      <button onClick={generatePDFReport} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Generate PDF Report</button>
      
      {/* Hidden canvas for SINGLE chart */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '450px', height: '350px' }}> {/* Increased size for better PDF quality */}
        <canvas ref={typeChartRef} />
      </div>
      
      {/* ... rest of the visible analytics UI (displaying data before PDF generation) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Card: Product Overview */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Product Overview</h3>
          <ul className="text-sm space-y-1 text-gray-600">
            <li>Total Unique Products: <span className="font-medium text-gray-800">{totalProductCount}</span></li>
            <li>Gas Cylinders: <span className="font-medium text-gray-800">{productTypeDist.find(t => t._id === 'Gas Cylinder')?.count || 0}</span></li>
            <li>Accessories: <span className="font-medium text-gray-800">{productTypeDist.find(t => t._id === 'Accessory')?.count || 0}</span></li>
          </ul>
        </div>
        {/* Example Card: Inventory Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Inventory Summary</h3>
           <ul className="text-sm space-y-1 text-gray-600">
             <li>Total Units: <span className="font-medium text-gray-800">{products.reduce((sum, p) => sum + p.quantity, 0)}</span></li>
             <li>Low Stock Items: <span className="font-medium text-red-600">{lowStockProducts.length}</span></li>
             <li>Out of Stock Items: <span className="font-medium text-red-800">{outOfStockProducts.length}</span></li>
           </ul>
        </div>
        {/* Example Card: Financial Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-2 text-gray-700">Financial Summary</h3>
           <ul className="text-sm space-y-1 text-gray-600">
             <li>Total Inventory Value: <span className="font-medium text-green-700">LKR {products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}</span></li>
             <li>Avg. Product Price: <span className="font-medium text-gray-800">LKR {avgProductPrice.toFixed(2)}</span></li>
           </ul>
        </div>
        {/* Add more preview cards if desired */}
      </div>
    </div>
  );
};

export default ProductAnalyticsReport;