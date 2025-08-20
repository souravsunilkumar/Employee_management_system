import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getChatbotResponse, clearChatHistory, clearError } from '../redux/aiSlice';
import { FaRobot, FaUser, FaPaperPlane, FaSpinner, FaTrash, FaTimes } from 'react-icons/fa';

const AIChatbot = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { chatHistory, loading, errors } = useSelector(state => state.ai);
  const [query, setQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading.chatbot) return;

    const userQuery = query.trim();
    setQuery('');
    
    dispatch(clearError({ feature: 'chatbot' }));
    await dispatch(getChatbotResponse(userQuery));
  };

  const handleClearHistory = () => {
    dispatch(clearChatHistory());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-96'
      }`}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <FaRobot className="mr-2" size={20} />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isMinimized ? '□' : '−'}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <FaRobot className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm">Hi! I'm your AI assistant.</p>
                  <p className="text-xs mt-1">Ask me about your tasks, performance, or anything work-related!</p>
                </div>
              )}

              {chatHistory.map((chat) => (
                <div key={chat.id} className="space-y-2">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-xs">
                      <div className="flex items-center mb-1">
                        <FaUser className="mr-1" size={12} />
                        <span className="text-xs">You</span>
                      </div>
                      <p className="text-sm">{chat.query}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 max-w-xs">
                      <div className="flex items-center mb-1">
                        <FaRobot className="mr-1 text-blue-500" size={12} />
                        <span className="text-xs">AI Assistant</span>
                      </div>
                      <p className="text-sm">{chat.response}</p>
                    </div>
                  </div>
                </div>
              ))}

              {loading.chatbot && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin mr-2 text-blue-500" size={12} />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              {errors.chatbot && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  {errors.chatbot.includes('only available for employees') ? (
                    <>
                      <FaRobot className="mx-auto mb-2 text-red-500" size={24} />
                      <p className="text-red-700 font-medium">Access Restricted</p>
                      <p className="text-red-600 text-sm mt-1">Chatbot is only available for employees</p>
                      <p className="text-gray-600 text-xs mt-2">Please log in with an employee account to use this feature</p>
                    </>
                  ) : errors.chatbot.includes('temporarily offline') ? (
                    <>
                      <FaRobot className="mx-auto mb-2 text-orange-500" size={24} />
                      <p className="text-orange-700 font-medium">Service Unavailable</p>
                      <p className="text-orange-600 text-sm mt-1">The AI service is temporarily offline</p>
                      <p className="text-gray-600 text-xs mt-2">Please try again later</p>
                    </>
                  ) : (
                    <p className="text-red-700 text-sm">{errors.chatbot}</p>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.chatbot}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading.chatbot}
                  className={`p-2 rounded-lg transition-colors ${
                    !query.trim() || loading.chatbot
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <FaPaperPlane size={14} />
                </button>
                {chatHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                    title="Clear chat history"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatbot;
