
import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { BotIcon, UserIcon } from './icons';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatbotResponse(messages, input);
      const modelMessage: ChatMessage = { role: 'model', parts: [{ text: responseText }] };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting. Please try again later." }] };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg flex flex-col h-[70vh]">
      <h2 className="text-xl font-bold text-teal-400 mb-4">Financial Assistant Chat</h2>
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BotIcon className="w-8 h-8 text-teal-400 flex-shrink-0" />}
            <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
              <p>{msg.parts[0].text}</p>
            </div>
            {msg.role === 'user' && <UserIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <BotIcon className="w-8 h-8 text-teal-400" />
            <div className="p-3 rounded-lg bg-gray-700 text-gray-300">
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your finances..."
          className="flex-1 bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-md transition duration-300">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
