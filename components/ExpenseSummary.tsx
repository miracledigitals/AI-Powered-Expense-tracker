import React, { useState } from 'react';
import { getExpenseSummary } from '../services/geminiService';
import { Expense } from '../types';
import { SparklesIcon } from './icons';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (expenses.length < 3) {
      setError("Add at least 3 expenses to generate a summary.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const expensesJson = JSON.stringify(expenses.map(({id, ...rest}) => rest)); // Remove IDs for a cleaner prompt
      const result = await getExpenseSummary(expensesJson);
      setSummary(result);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-xl font-bold text-teal-400 mb-2">AI Spending Summary</h2>
            <p className="text-sm text-gray-400 mb-4">Get a quick overview of your spending habits.</p>
        </div>
        <button 
            onClick={handleGenerateSummary} 
            disabled={isLoading || expenses.length === 0}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
            <SparklesIcon className="w-5 h-5" />
            {summary ? 'Regenerate' : 'Generate'}
        </button>
      </div>
      
      {isLoading && (
        <div className="p-4 mt-4 bg-gray-700 rounded-lg text-gray-400 animate-pulse">
          Generating your summary...
        </div>
      )}

      {summary && !isLoading && (
        <div className="p-4 mt-4 bg-gray-700 rounded-lg text-gray-300">
          {summary}
        </div>
      )}

      {error && !isLoading && <p className="text-red-400 mt-4">{error}</p>}

    </div>
  );
};

export default ExpenseSummary;