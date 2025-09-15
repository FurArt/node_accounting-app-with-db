const formatUserResponse = (user) => {
  return {
    id: user.id,
    name: user.name
  };
};

const formatExpenseResponse = (expense) => {
  return {
    id: expense.id,
    userId: expense.userId || expense.user_id,
    spentAt: expense.spentAt || expense.spent_at,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    note: expense.note || ''
  };
};

const formatUsersResponse = (users) => {
  return users.map(formatUserResponse);
};

const formatExpensesResponse = (expenses) => {
  return expenses.map(formatExpenseResponse);
};

module.exports = {
  formatUserResponse,
  formatExpenseResponse,
  formatUsersResponse,
  formatExpensesResponse
};
