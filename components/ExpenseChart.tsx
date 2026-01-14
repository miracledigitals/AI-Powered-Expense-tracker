import React from 'react';
import { Expense } from '../types';

interface ExpenseChartProps {
  expenses: Expense[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    
  const categoryTotals: { [key: string]: number } = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  const chartData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
  
  const colors = [
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-teal-400 mb-4">Spending by Category</h2>
      <div className="space-y-4">
        {totalExpenses === 0 ? (
          <p className="text-gray-400">No data to display. Add some expenses to see the chart.</p>
        ) : (
          chartData.map(({ category, amount, percentage }, index) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300">{category}</span>
                <span className="text-sm font-medium text-gray-400">{formatCurrency(amount)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className={`${colors[index % colors.length]} h-4 rounded-full`}
                  style={{ width: `${percentage}%` }}
                  title={`${percentage.toFixed(1)}%`}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;