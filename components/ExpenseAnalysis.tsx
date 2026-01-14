
import React, { useState } from 'react';
import { analyzeExpenses } from '../services/geminiService';
import { Expense } from '../types';
import { SparklesIcon } from './icons';

interface ExpenseAnalysisProps {
  expenses: Expense[];
}

const ExpenseAnalysis: React.FC<ExpenseAnalysisProps> = ({ expenses }) => {
  const [prompt, setPrompt] = useState('Summarize my spending habits for this period.');
  const [useProModel, setUseProModel] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (expenses.length === 0) {
      setError("No expense data to analyze.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const expensesJson = JSON.stringify(expenses, null, 2);
      const result = await analyzeExpenses(expensesJson, prompt, useProModel);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to get analysis. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-teal-400">AI Expense Analysis</h2>
      <p className="text-gray-400">Get AI-powered insights into your spending. Ask any question about your expenses.</p>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Which category am I overspending on?"
          rows={3}
          className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        
        <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                id="useProModel"
                checked={useProModel}
                onChange={(e) => setUseProModel(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="useProModel" className="text-gray-300">Use advanced model (slower, more detailed)</label>
        </div>
        
        <button onClick={handleAnalysis} disabled={isLoading || expenses.length === 0} className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition duration-300">
          {isLoading ? 'Analyzing...' : 'Analyze Expenses'}
          <SparklesIcon className="w-5 h-5" />
        </button>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      
      <div className="mt-6">
        {isLoading && (
            <div className="w-full p-4 bg-gray-700 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
        )}
        {analysis && (
            <div>
                <h3 className="font-semibold mb-2 text-teal-300">Analysis Result:</h3>
                <div className="p-4 bg-gray-700 rounded-lg text-gray-300 whitespace-pre-wrap">{analysis}</div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAnalysis;
