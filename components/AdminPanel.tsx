
import React, { useState } from "react";
import type { AdminSettings, ChatMessage } from "../types";

interface AdminPanelProps {
  settings: AdminSettings;
  defaultSystemInstruction: string;
  expiredHtsCodes: string[];
  correctResponses: Record<string, ChatMessage>;
  incorrectResponses: Array<{ userInput: string; botResponse: string }>;
  onAddExpiredCode: (code: string) => void;
  onRemoveExpiredCode: (code: string) => void;
  onRemoveCorrectResponse: (key: string) => void;
  onRemoveIncorrectResponse: (index: number) => void;
  onSave: (newSettings: AdminSettings) => void;
  onClose: () => void;
  onClearHistory: () => void;
  onEraseAllMemory: () => void;
}


export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  defaultSystemInstruction,
  expiredHtsCodes,
  correctResponses,
  incorrectResponses,
  onAddExpiredCode,
  onRemoveExpiredCode,
  onRemoveCorrectResponse,
  onRemoveIncorrectResponse,
  onSave,
  onClose,
  onClearHistory,
}) => {
  const [currentSettings, setCurrentSettings] = useState<AdminSettings>(settings);
  const [newExpiredCode, setNewExpiredCode] = useState("");
  const [activeTab, setActiveTab] = useState<'system'|'expired'|'correct'|'incorrect'|'history'|'settings'|'database'|'memory'>('system');
  const [selectedHistory, setSelectedHistory] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  // Get all chat history from localStorage with error handling
  let chatHistory: ChatMessage[] = [];
  try {
    const saved = localStorage.getItem('chatHistory');
    if (saved) chatHistory = JSON.parse(saved);
  } catch (e) {
    setError('Failed to load chat history.');
  }

  const handleSave = () => {
    try {
      onSave(currentSettings);
      onClose();
    } catch (e) {
      setError('Failed to save settings. Please try again.');
    }
  };

  const handleReset = () => {
    setCurrentSettings({
      ...currentSettings,
      systemInstruction: defaultSystemInstruction,
    });
  };

  const handleAddExpiredCode = () => {
    if (newExpiredCode.trim()) {
      try {
        onAddExpiredCode(newExpiredCode.trim());
        setNewExpiredCode("");
      } catch (e) {
        setError('Failed to add expired code.');
      }
    }
  };

  const handleClearHistoryClick = () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete all chat history?"
      )
    ) {
      try {
        onClearHistory();
        setSelectedHistory(new Set());
      } catch (e) {
        setError('Failed to clear history.');
      }
    }
  };

  const handleEraseAllClick = () => {
  if (
    window.confirm(
      "⚠️ This will erase ALL memory: chat history, expired codes, caches, and settings. Continue?"
    )
  ) {
    try {
      onEraseAllMemory();
    } catch (e) {
      setError("Failed to erase memory.");
    }
  }
};

  const handleDeleteSelectedHistory = () => {
    if (selectedHistory.size === 0) return;
    if (!window.confirm('Delete selected history entries?')) return;
    try {
      const saved = localStorage.getItem('chatHistory');
      if (!saved) return;
      let history: ChatMessage[] = JSON.parse(saved);
      history = history.filter(msg => !selectedHistory.has(msg.id));
      localStorage.setItem('chatHistory', JSON.stringify(history));
      setSelectedHistory(new Set());
      window.location.reload(); // quick way to update admin panel after delete
    } catch (e) {
      setError('Failed to delete selected history.');
    }
  };
  
  const truncate = (str: string, length: number) => {
    return str.length > length ? str.substring(0, length) + "..." : str;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2 sm:p-6">
      <div className="w-full max-w-2xl min-w-[320px] max-h-[95vh] h-auto bg-white dark:bg-gray-800 shadow-2xl flex flex-col rounded-2xl border border-blue-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
        <header className="p-4 bg-blue-50 dark:bg-blue-900 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-100">Admin Controls</h2>
            <p className="text-sm text-blue-600 dark:text-blue-300">Configure AI assistant settings and manage responses</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors"
            aria-label="Close admin panel"
          >
            &times;
          </button>
        </header>
        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 text-sm text-center">{error}</div>
        )}
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900">
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='system' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('system')}>System Instruction</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='settings' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('settings')}>Settings</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='memory' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('memory')}>Memory</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='expired' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('expired')}>Expired HTS</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='correct' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('correct')}>Correct Cache</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='incorrect' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('incorrect')}>Blocklist</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='history' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('history')}>History</button>
          <button className={`flex-1 min-w-[120px] py-3 text-sm font-semibold transition-colors ${activeTab==='database' ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200' : 'text-blue-700/70 dark:text-blue-200/70'}`} onClick={()=>setActiveTab('database')}>Database</button>
        </div>
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-0">
          {/* System Instruction Tab */}
          {activeTab==='system' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                AI System Instruction
              </label>
              <textarea
                rows={8}
                className="w-full p-3 border border-blue-200 dark:border-blue-700 rounded-lg shadow-inner bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={currentSettings.systemInstruction}
                onChange={(e) =>
                  setCurrentSettings({
                    ...currentSettings,
                    systemInstruction: e.target.value,
                  })
                }
              />
              <p className="mt-2 text-xs text-gray-500">
                Guides the AI's reasoning and response format.
              </p>
            </div>
          )}
          {/* Expired HTS Tab */}
          {activeTab==='expired' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Expired HTS Codes</h3>
              <div className="flex mb-3">
                <input
                  type="text"
                  placeholder="Enter HTS code"
                  className="flex-1 p-2 border border-blue-200 dark:border-blue-700 rounded-l-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={newExpiredCode}
                  onChange={(e) => setNewExpiredCode(e.target.value)}
                />
                <button
                  onClick={handleAddExpiredCode}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                {expiredHtsCodes.length > 0 ? (
                  expiredHtsCodes.map((code) => (
                    <div
                      key={code}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <span className="font-mono text-sm">{code}</span>
                      <button
                        onClick={() => onRemoveExpiredCode(code)}
                        className="text-red-600 hover:text-red-700 font-bold transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No expired HTS codes set
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Correct Cache Tab */}
          {activeTab==='correct' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Correct Cached Responses</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                {Object.keys(correctResponses).length > 0 ? (
                  Object.entries(correctResponses).map(([key, response]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <span className="text-sm" title={key}>{truncate(key, 50)}</span>
                      <button
                        onClick={() => onRemoveCorrectResponse(key)}
                        className="text-red-600 hover:text-red-700 font-bold transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No correct responses cached
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Blocklist Tab */}
          {activeTab==='incorrect' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Incorrect Response Blocklist</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                {incorrectResponses.length > 0 ? (
                  incorrectResponses.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <span className="text-sm" title={item.userInput}>{truncate(item.userInput, 50)}</span>
                      <button
                        onClick={() => onRemoveIncorrectResponse(index)}
                        className="text-red-600 hover:text-red-700 font-bold transition-colors"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No incorrect responses blocklisted
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Settings Tab */}
          {activeTab==='settings' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Response Temperature
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentSettings.temperature || 70}
                      onChange={(e) => setCurrentSettings(prev => ({
                        ...prev,
                        temperature: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>More Focused</span>
                      <span>More Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Response Tokens
                    </label>
                    <select
                      value={currentSettings.maxTokens || 2048}
                      onChange={(e) => setCurrentSettings(prev => ({
                        ...prev,
                        maxTokens: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    >
                      <option value="1024">1024 tokens</option>
                      <option value="2048">2048 tokens</option>
                      <option value="4096">4096 tokens</option>
                      <option value="8192">8192 tokens</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentSettings.useCache}
                        onChange={(e) => setCurrentSettings(prev => ({
                          ...prev,
                          useCache: e.target.checked
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable Response Caching</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      value={currentSettings.apiEndpoint || ''}
                      onChange={(e) => setCurrentSettings(prev => ({
                        ...prev,
                        apiEndpoint: e.target.value
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="https://api.example.com/v1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Memory Management Tab */}
          {activeTab==='memory' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Memory Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Chat History</h4>
                      <p className="text-sm text-gray-500">Clear all conversation history</p>
                    </div>
                    <button
                      onClick={handleClearHistoryClick}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Clear History
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Response Cache</h4>
                      <p className="text-sm text-gray-500">Clear cached responses</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all cached responses?')) {
                          // Clear correct responses cache
                          onRemoveCorrectResponse('');
                        }
                      }}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Clear Cache
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Settings Reset</h4>
                      <p className="text-sm text-gray-500">Reset all settings to default</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Reset Settings
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-red-200">
                    <div>
                      <h4 className="font-medium text-red-600">Complete Reset</h4>
                      <p className="text-sm text-gray-500">Erase all data and start fresh</p>
                    </div>
                    <button
                      onClick={handleEraseAllClick}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Erase All
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Memory Usage</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Chat History</span>
                    <span className="text-gray-900 dark:text-gray-100">{chatHistory.length} messages</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cached Responses</span>
                    <span className="text-gray-900 dark:text-gray-100">{Object.keys(correctResponses).length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Expired HTS Codes</span>
                    <span className="text-gray-900 dark:text-gray-100">{expiredHtsCodes.length} codes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Management Tab */}
          {activeTab==='database' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Database Management</h3>
                <div className="space-y-4">
                  {/* Database Status */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Database Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Connection Status</p>
                        <p className="text-sm font-medium text-green-600">Connected</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Sync</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Database Operations */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to sync the database?')) {
                          // Implement database sync
                          alert('Database sync initiated');
                        }
                      }}
                      className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sync Database
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to backup the database?')) {
                          // Implement database backup
                          alert('Database backup initiated');
                        }
                      }} 
                      className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Backup Database
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('⚠️ Are you sure you want to reset the database? This cannot be undone!')) {
                          // Implement database reset
                          alert('Database reset initiated');
                        }
                      }}
                      className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reset Database
                    </button>
                  </div>
                </div>
              </div>

              {/* Database Statistics */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Database Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Records</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">1,234</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Cache Size</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">256 KB</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">2 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab==='history' && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-3">Chat/Search History</h3>
              <div className="flex justify-between mb-2">
                <button
                  onClick={handleClearHistoryClick}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                  Clear All
                </button>
                <button
                  onClick={handleDeleteSelectedHistory}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  disabled={selectedHistory.size===0}
                >
                  Delete Selected
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-blue-100 dark:divide-gray-700">
                {chatHistory.length > 0 ? (
                  chatHistory.map((msg) => (
                    <div key={msg.id} className="flex items-center gap-2 py-2 px-1 hover:bg-blue-50 dark:hover:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={selectedHistory.has(msg.id)}
                        onChange={e => {
                          setSelectedHistory(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(msg.id);
                            else next.delete(msg.id);
                            return next;
                          });
                        }}
                        className="accent-blue-600"
                      />
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-200 truncate max-w-xs" title={msg.content}>{msg.role === 'user' ? 'User:' : 'Bot:'} {truncate(msg.content, 60)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No chat/search history found.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 rounded-b-2xl">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleEraseAllClick}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Erase All Memory
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminPanel;
