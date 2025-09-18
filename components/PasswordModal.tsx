
import React, { useState } from 'react';

interface PasswordModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const CORRECT_PASSWORD = "332";

export const PasswordModal: React.FC<PasswordModalProps> = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };
  
  const handleForgotPassword = () => {
    alert('A password reset verification email will be sent to "jas@teuinc.com".');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm m-4 relative">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Access</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Enter the password to access the admin controls.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password-input" className="sr-only">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center mb-4" role="alert">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-brand-secondary transition-colors"
          >
            Unlock
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={handleForgotPassword} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Forgot Password?
          </button>
        </div>
        
        <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

      </div>
    </div>
  );
};
