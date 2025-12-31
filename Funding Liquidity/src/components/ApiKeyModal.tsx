
import React, { useState } from 'react';
import { getApiKey, setApiKey } from '../services/dataService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: (keyProvided: boolean) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState(getApiKey());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (key.length < 10) {
      setError('Invalid API Key format.');
      return;
    }
    setApiKey(key);
    setError('');
    onClose(true);
  };

  const handleClose = () => {
    onClose(false);
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-xl p-6 shadow-2xl relative">
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
            ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-2">FRED® API Configuration</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          This dashboard requires a connection to the St. Louis Fed database. 
          Please provide a valid FRED API Key to fetch live rates and liquidity metrics.
        </p>

        <div className="space-y-4">
            <div>
                <label className="block text-xs font-mono text-gray-500 mb-1 uppercase">API Key</label>
                <input 
                    type="text" 
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="abcdef1234567890..."
                    className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-primary-500 transition-colors"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            <button 
                onClick={handleSave}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Connect & Load Data
            </button>

            <div className="border-t border-gray-800 pt-4 mt-2">
                <p className="text-xs text-gray-500 text-center">
                    Don't have a key? <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">Get one for free from FRED</a>.
                </p>
                <p className="text-[10px] text-gray-600 text-center mt-2">
                    Requests are routed via corsproxy.io to bypass browser restrictions. Key is stored locally in your browser.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
