import React, { useState } from 'react';
import { Expense, Budget } from '../types';

interface BudgetingPageProps {
  expenses: Expense[];
  budgets: Budget[];
  onSetBudget: (budget: Budget) => void;
  categories: string[];
  presetCategories: string[];
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
}

const BudgetingPage: React.FC<BudgetingPageProps> = ({
  expenses,
  budgets,
  onSetBudget,
  categories,
  presetCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ old: string; new: string } | null>(null);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const handleBudgetChange = (category: string, limit: string) => {
    if (limit === '') {
      onSetBudget({ category, limit: 0 });
      return;
    }
    const numericLimit = parseFloat(limit);
    if (!isNaN(numericLimit) && numericLimit >= 0) {
      onSetBudget({ category, limit: numericLimit });
    }
  };
  
  const handleClearBudget = (category: string) => {
    onSetBudget({ category, limit: 0 });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
        onAddCategory(newCategory.trim());
        setNewCategory('');
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.new.trim()) {
      onUpdateCategory(editingCategory.old, editingCategory.new.trim());
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-teal-400 mb-4">Budget Status</h2>
        <div className="space-y-4">
          {categories.map((category) => {
            const spent = categoryTotals[category] || 0;
            const budget = budgets.find(b => b.category === category);
            const limit = budget?.limit || 0;
            const remaining = limit - spent;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            
            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-300">{category}</span>
                  <span className="text-sm text-gray-400">
                    {formatCurrency(spent)} / {limit > 0 ? formatCurrency(limit) : 'Not set'}
                  </span>
                </div>
                {limit > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${percentage > 100 ? 'bg-red-500' : 'bg-teal-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
                 <div className="flex justify-between items-center mt-1 text-sm">
                    <span>{limit > 0 ? `${percentage.toFixed(0)}% spent` : ''}</span>
                    <span className={remaining < 0 ? 'text-red-400' : 'text-green-400'}>
                        {limit > 0 ? `${formatCurrency(remaining)} remaining` : ''}
                    </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-teal-400 mb-4">Set Budgets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {categories.map(category => {
            const budgetLimit = budgets.find(b => b.category === category)?.limit;
            return (
                <div key={category} className="flex items-center justify-between gap-2">
                    <label htmlFor={`budget-${category}`} className="flex-1 text-gray-300 truncate" title={category}>{category}</label>
                    <div className="flex items-center gap-2">
                        <input
                        id={`budget-${category}`}
                        type="number"
                        placeholder="Not set"
                        value={budgetLimit ?? ''}
                        onChange={(e) => handleBudgetChange(category, e.target.value)}
                        className="w-32 bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                        onClick={() => handleClearBudget(category)}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded-md transition duration-300 text-sm"
                        aria-label={`Clear budget for ${category}`}
                        >
                        Clear
                        </button>
                    </div>
                </div>
            )
          })}
        </div>
      </div>
      
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-teal-400 mb-4">Manage Categories</h2>
         <div className="flex gap-2 mb-4">
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="flex-1 bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button onClick={handleAddCategory} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md">Add</button>
         </div>
         <div className="space-y-2">
            {categories.map(category => (
                <div key={category} className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                   {editingCategory?.old === category ? (
                     <input
                       type="text"
                       value={editingCategory.new}
                       onChange={(e) => setEditingCategory({ old: category, new: e.target.value })}
                       className="bg-gray-600 text-white p-1 rounded-md"
                       autoFocus
                     />
                   ) : (
                     <span>{category}</span>
                   )}
                   {!presetCategories.includes(category) && (
                     <div className="flex gap-2">
                        {editingCategory?.old === category ? (
                            <>
                                <button onClick={handleUpdateCategory} className="text-green-400 hover:text-green-300">Save</button>
                                <button onClick={() => setEditingCategory(null)} className="text-gray-400 hover:text-gray-300">Cancel</button>
                            </>
                        ) : (
                            <button onClick={() => setEditingCategory({ old: category, new: category })} className="text-blue-400 hover:text-blue-300">Edit</button>
                        )}
                       <button onClick={() => onDeleteCategory(category)} className="text-red-500 hover:text-red-400">Delete</button>
                     </div>
                   )}
                </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default BudgetingPage;