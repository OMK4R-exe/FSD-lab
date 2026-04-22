const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @route   GET /api/reports/dashboard
// @desc    Get dashboard summary data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user._id;

    // Total income
    const incomeResult = await Transaction.aggregate([
      { $match: { user: userId, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Total expenses
    const expenseResult = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const totalBalance = totalIncome - totalExpenses;

    // Expense by category
    const expenseByCategory = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly expenses (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(10);

    res.json({
      totalBalance,
      totalIncome,
      totalExpenses,
      expenseByCategory,
      monthlyExpenses,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/analytics
// @desc    Get analytics/reports data
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Monthly income & expenses
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Process monthly data into income/expense arrays
    const monthlyIncome = [];
    const monthlyExpensesArr = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Build 6-month range
    const monthRange = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthRange.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: months[d.getMonth()],
      });
    }

    monthRange.forEach((m) => {
      const income = monthlyData.find(
        (d) => d._id.year === m.year && d._id.month === m.month && d._id.type === 'income'
      );
      const expense = monthlyData.find(
        (d) => d._id.year === m.year && d._id.month === m.month && d._id.type === 'expense'
      );
      monthlyIncome.push({ month: m.label, amount: income?.total || 0 });
      monthlyExpensesArr.push({ month: m.label, amount: expense?.total || 0 });
    });

    // Calculate averages
    const avgMonthlyIncome =
      monthlyIncome.reduce((sum, m) => sum + m.amount, 0) / Math.max(monthlyIncome.filter(m => m.amount > 0).length, 1);
    const avgMonthlyExpenses =
      monthlyExpensesArr.reduce((sum, m) => sum + m.amount, 0) / Math.max(monthlyExpensesArr.filter(m => m.amount > 0).length, 1);

    const savingsRate =
      avgMonthlyIncome > 0
        ? ((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome) * 100
        : 0;

    // Savings trend
    const savingsTrend = monthRange.map((m, i) => ({
      month: m.label,
      savings: monthlyIncome[i].amount - monthlyExpensesArr[i].amount,
    }));

    res.json({
      avgMonthlyIncome: Math.round(avgMonthlyIncome),
      avgMonthlyExpenses: Math.round(avgMonthlyExpenses),
      savingsRate: Math.round(savingsRate * 10) / 10,
      monthlyIncome,
      monthlyExpenses: monthlyExpensesArr,
      savingsTrend,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
