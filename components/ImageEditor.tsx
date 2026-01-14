
import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import { EditIcon } from './icons';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEditedImageUrl(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !prompt) {
      setError("Please select an image and enter a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const resultUrl = await editImageWithGemini(originalImage, prompt);
      setEditedImageUrl(resultUrl);
    } catch (err) {
      setError("Failed to edit image. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-teal-400">AI Image Editor</h2>
      <p className="text-gray-400">Upload an image and tell the AI how to edit it.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {originalImage ? `Selected: ${originalImage.name}` : 'Select an Image'}
        </button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Make the background futuristic"
          className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        
        <button type="submit" disabled={isLoading || !prompt || !originalImage} className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition duration-300">
          {isLoading ? 'Editing...' : 'Edit Image'}
          <EditIcon className="w-5 h-5" />
        </button>
      </form>

      {error && <p className="text-red-400">{error}</p>}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {originalImageUrl && (
            <div>
                <h3 className="font-semibold mb-2">Original</h3>
                <img src={originalImageUrl} alt="Original" className="rounded-lg w-full h-auto max-w-md mx-auto object-cover" />
            </div>
          )}
        </div>
        <div>
          {isLoading && (
              <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                <p className="text-gray-400">Editing...</p>
              </div>
          )}
          {editedImageUrl && (
              <div>
                  <h3 className="font-semibold mb-2">Result</h3>
                  <img src={editedImageUrl} alt="Edited" className="rounded-lg w-full h-auto max-w-md mx-auto object-cover" />
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
