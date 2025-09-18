
import React, { useState } from 'react';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Please wait..." : "Select import country above, then describe commodity..."}
        disabled={isLoading}
        className="flex-1 p-3 border border-border-color rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </form>
  );
};
