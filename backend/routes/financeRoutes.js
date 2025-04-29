const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");

// GET profit/loss report
router.get("/profit-loss", financeController.getProfitLossReport);

module.exports = router;