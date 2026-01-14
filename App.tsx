import React, { useState, useEffect } from 'react';
import { Expense, Budget, Tab } from './types';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseChart from './components/ExpenseChart';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import Chatbot from './components/Chatbot';
import ExpenseAnalysis from './components/ExpenseAnalysis';
import BudgetingPage from './components/BudgetingPage';
import ExpenseSummary from './components/ExpenseSummary';

const PRESET_CATEGORIES = ["Food", "Subscriptions", "Transportation"];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });
  
  const [categories, setCategories] = useState<string[]>(() => {
    const savedCustomCategories = localStorage.getItem('customCategories');
    const customCategories = savedCustomCategories ? JSON.parse(savedCustomCategories) : [];
    return [...PRESET_CATEGORIES, ...customCategories];
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);
  
  useEffect(() => {
    const customCategories = categories.filter(c => !PRESET_CATEGORIES.includes(c));
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  }, [categories]);


  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses([...expenses, { ...expense, id: crypto.randomUUID() }]);
  };
  
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };
  
  const setBudget = (budget: Budget) => {
    setBudgets(prev => {
        const existing = prev.find(b => b.category === budget.category);
        if (existing) {
            return prev.map(b => b.category === budget.category ? budget : b);
        }
        return [...prev, budget];
    });
  };

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => prev.map(c => c === oldCategory ? newCategory : c));
      // Update existing expenses and budgets with the new category name
      setExpenses(prev => prev.map(e => e.category === oldCategory ? { ...e, category: newCategory } : e));
      setBudgets(prev => prev.map(b => b.category === oldCategory ? { ...b, category: newCategory } : b));
    }
  };

  const deleteCategory = (categoryToDelete: string) => {
    if (PRESET_CATEGORIES.includes(categoryToDelete)) return; // Prevent deleting preset categories
    setCategories(prev => prev.filter(c => c !== categoryToDelete));
    // Optionally remove expenses/budgets with this category, or re-categorize them
    // For now, we'll leave them as is, but they won't be editable under this category anymore
  };


  const renderContent = () => {
    switch (activeTab) {
      case Tab.Dashboard:
        return (
          <div className="space-y-6">
            <ExpenseSummary expenses={expenses} />
            <ExpenseForm onAddExpense={addExpense} categories={categories} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense}/>
              <ExpenseChart expenses={expenses} />
            </div>
          </div>
        );
      case Tab.Budgeting:
        return (
            <BudgetingPage 
                expenses={expenses} 
                budgets={budgets} 
                onSetBudget={setBudget}
                categories={categories}
                presetCategories={PRESET_CATEGORIES}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onDeleteCategory={deleteCategory}
            />
        );
      case Tab.Analysis:
        return <ExpenseAnalysis expenses={expenses} />;
      case Tab.ImageTools:
        return (
            <div className="space-y-6">
                <ImageGenerator />
                <ImageEditor />
            </div>
        )
      case Tab.Chatbot:
        return <Chatbot />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-center text-teal-400">
            AI-Powered Expense Tracker
          </h1>
          <p className="text-center text-gray-400 mt-2">Manage your finances with the power of Gemini</p>
        </header>
        
        <nav className="mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
          {Object.values(Tab).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold rounded-lg transition-colors duration-300 ${
                activeTab === tab
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;