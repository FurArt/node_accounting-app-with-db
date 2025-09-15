'use strict';

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./db');

// Import routes
const usersRouter = require('./routes/users');
const expensesRouter = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');

const createServer = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/users', usersRouter);
  app.use('/expenses', expensesRouter);
  app.use('/categories', categoriesRouter);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // Test database connection (non-blocking)
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection established successfully.');

      // Sync database after successful connection
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
  createServer
};
