'use strict';

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./db');

const usersRouter = require('./routes/users');
const expensesRouter = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');

const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/users', usersRouter);
  app.use('/expenses', expensesRouter);
  app.use('/categories', categoriesRouter);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  sequelize
    .authenticate()
    .then(() => {
      return sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    })
    .then(() => {
      console.log('✅ Database synchronized successfully.');
    })
    .catch((error) => {
      console.error('❌ Database error:', error.message);
    });

  return app;
};

module.exports = {
  createServer,
};
