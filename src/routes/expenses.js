const express = require('express');
const { Expense, User } = require('../models');
const { Op } = require('sequelize');
const { formatExpenseResponse, formatExpensesResponse } = require('../utils/responseFormatters');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId, categories, from, to } = req.query;

    let whereClause = {};

    if (userId && !isNaN(userId)) {
      whereClause.user_id = parseInt(userId);
    }

    if (from && to) {
      whereClause.spent_at = {
        [Op.between]: [new Date(from), new Date(to)]
      };
    }

    if (categories) {
      const categoryList = Array.isArray(categories) ? categories : [categories];
      whereClause.category = {
        [Op.in]: categoryList
      };
    }

    const expenses = await Expense.findAll({
      where: whereClause,
      order: [['spent_at', 'DESC']]
    });

    res.status(200).json(formatExpensesResponse(expenses));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (userId === undefined || !spentAt || !title || !amount || !category) {
      return res.status(400).json({
        error: 'Bad request - Required fields are missing'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'Bad request - User not found' });
    }

    const existingExpense = await Expense.findOne({
      where: {
        title,
        spent_at: new Date(spentAt),
        user_id: userId
      }
    });

    if (existingExpense) {
      return res.status(400).json({
        error: 'Bad request - Expense with the same title and date already exists'
      });
    }

    const newExpense = await Expense.create({
      user_id: userId,
      spent_at: new Date(spentAt),
      title,
      amount,
      category,
      note: note || ''
    });

    res.status(201).json(formatExpenseResponse(newExpense));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);

    if (isNaN(expenseId)) {
      return res.status(400).json({ error: 'Bad request - Invalid expense ID' });
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.status(200).json(formatExpenseResponse(expense));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);
    const { spentAt, title, amount, category, note } = req.body;

    if (isNaN(expenseId)) {
      return res.status(400).json({ error: 'Bad request - Invalid expense ID' });
    }

    if (!spentAt && !title && !amount && !category && note === undefined) {
      return res.status(400).json({
        error: 'Bad request - At least one field is required for update'
      });
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (spentAt) expense.spent_at = new Date(spentAt);
    if (title) expense.title = title;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (note !== undefined) expense.note = note;

    await expense.save();

    res.status(200).json(formatExpenseResponse(expense));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);

    if (isNaN(expenseId)) {
      return res.status(400).json({ error: 'Bad request - Invalid expense ID' });
    }

    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Not found' });
    }

    await expense.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
