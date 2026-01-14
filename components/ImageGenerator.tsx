
import React, { useState } from 'react';
import { generateImageWithImagen } from '../services/geminiService';
import { SparklesIcon } from './icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const resultUrl = await generateImageWithImagen(prompt);
      setGeneratedImageUrl(resultUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-teal-400">AI Image Generator</h2>
      <p className="text-gray-400">Generate an image for an expense category or just for fun. Be descriptive!</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A minimalist logo for 'Utilities'"
          className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        
        <button type="submit" disabled={isLoading || !prompt} className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition duration-300">
          {isLoading ? 'Generating...' : 'Generate Image'}
          <SparklesIcon className="w-5 h-5" />
        </button>
      </form>

      {error && <p className="text-red-400">{error}</p>}
      
      <div className="mt-6">
        {isLoading && (
            <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
              <p className="text-gray-400">Generating...</p>
            </div>
        )}
        {generatedImageUrl && (
            <div>
                <h3 className="font-semibold mb-2">Result</h3>
                <img src={generatedImageUrl} alt="Generated" className="rounded-lg w-full h-auto max-w-md mx-auto object-cover" />
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
