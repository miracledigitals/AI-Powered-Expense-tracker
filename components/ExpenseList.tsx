import React from 'react';
import { Expense } from '../types';
import { TrashIcon, DownloadIcon } from './icons';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const headers = ['ID', 'Description', 'Amount', 'Category', 'Date'];
    const rows = expenses.map(expense => 
      [
        expense.id,
        `"${expense.description.replace(/"/g, '""')}"`, // Handle quotes in description
        expense.amount,
        expense.category,
        expense.date
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'expenses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-teal-400">Recent Expenses</h2>
        <button
          onClick={handleExportCSV}
          disabled={expenses.length === 0}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white font-semibold py-2 px-3 rounded-md transition duration-300 text-sm"
          aria-label="Export expenses to CSV"
        >
          <DownloadIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {expenses.length === 0 ? (
          <p className="text-gray-400">No expenses recorded yet.</p>
        ) : (
          [...expenses].reverse().map((expense) => (
            <div key={expense.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
              <div>
                <p className="font-semibold text-white">{expense.description}</p>
                <p className="text-sm text-gray-400">{expense.category} - {new Date(expense.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-lg text-teal-300">{formatCurrency(expense.amount)}</p>
                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  className="text-red-500 hover:text-red-400"
                  aria-label="Delete expense"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;