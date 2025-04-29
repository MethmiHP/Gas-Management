const Order = require("../models/orderModel");

// Profit/Loss Report - Filter by full Date range or Month and Year
const getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate, month, year } = req.query;

    let filter = {};

    if (startDate && endDate) {
      // Filter by date range
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);

      filter.timestamp = { $gte: parsedStartDate, $lte: parsedEndDate };
    } else if (month && year) {
      // Filter by specific month and year
      const parsedMonth = parseInt(month) - 1; // JavaScript months are 0-indexed
      const parsedYear = parseInt(year);

      const startOfMonth = new Date(parsedYear, parsedMonth, 1);
      const endOfMonth = new Date(parsedYear, parsedMonth + 1, 0, 23, 59, 59, 999);

      filter.timestamp = { $gte: startOfMonth, $lte: endOfMonth };
    } else {
      return res.status(400).json({ message: "Please provide either (startDate and endDate) or (month and year)" });
    }

    // Fetch filtered orders
    const orders = await Order.find(filter);

    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => total + (order.amount || 0), 0);

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalRevenue,
      message: "Profit/Loss report generated successfully"
    });
  } catch (error) {
    console.error("Error generating profit/loss report:", error);
    return res.status(500).json({ message: "Server error while generating report", error: error.message });
  }
};

module.exports = { getProfitLossReport };

