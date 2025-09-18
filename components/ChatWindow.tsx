import React, { useRef, useEffect } from 'react';
import type { ChatMessage as MessageType } from '../types';
import { Message } from './Message';

interface ChatWindowProps {
  messages: MessageType[];
  searchQuery: string;
  isLoading: boolean;
  onReportExpired: (code: string) => void;
  onFeedback: (messageId: string, feedback: 'correct' | 'incorrect') => void;
  onCountrySelect: (messageId: string, country: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  searchQuery,
  isLoading,
  onReportExpired,
  onFeedback,
  onCountrySelect
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSearchResults = filteredMessages.length > 0;
  const isSearching = searchQuery.length > 0;

  const scrollToBottom = (force = false) => {
    if (!messagesEndRef.current) return;

    const container = messagesEndRef.current.parentElement;
    const isNearBottom =
      container &&
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (force || isNearBottom) {
      messagesEndRef.current.scrollIntoView({
        behavior: force ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  };

  // Auto-scroll when new messages are added, but check if it's a user message
  const prevMessagesLength = useRef(messages.length);
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const hasNewMessage = messages.length > prevMessagesLength.current;

    if (hasNewMessage && lastMessage?.role === 'user') {
      // Force scroll for user messages
      scrollToBottom(true);
    } else if (hasNewMessage && lastMessage?.role === 'bot' && !lastMessage.waitingForCountry) {
      // Smooth scroll for bot responses that aren't asking for country
      scrollToBottom(false);
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        Chat Window
      </div>

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {hasSearchResults &&
          filteredMessages.map(msg => (
            <Message
              key={msg.id}
              message={msg}
              onReportExpired={onReportExpired}
              onFeedback={onFeedback}
              onCountrySelect={onCountrySelect}
            />
          ))}

        {isSearching && !hasSearchResults && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No messages found for "{searchQuery}".
            </p>
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role !== 'bot' && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 p-4">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse delay-150"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                TEU GLOBAL AI is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        End of conversation
      </div>
    </div>
  );
};
