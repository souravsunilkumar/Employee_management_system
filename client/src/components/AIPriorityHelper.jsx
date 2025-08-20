import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { suggestPriority, clearError } from '../redux/aiSlice';
import { FaRobot, FaSpinner, FaExclamationTriangle, FaLightbulb } from 'react-icons/fa';

const AIPriorityHelper = ({ description, deadline, onPrioritySuggested }) => {
  const dispatch = useDispatch();
  const { prioritySuggestion, loading, errors } = useSelector(state => state.ai);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (prioritySuggestion && onPrioritySuggested) {
      // Extract priority level from suggestion
      const priorityMatch = prioritySuggestion.match(/Priority:\s*(Low|Medium|High|Critical)/i);
      if (priorityMatch) {
        onPrioritySuggested(priorityMatch[1]);
      }
    }
  }, [prioritySuggestion, onPrioritySuggested]);

  const handleSuggestPriority = async () => {
    if (!description || !deadline) {
      return;
    }
    
    dispatch(clearError({ feature: 'prioritySuggestion' }));
    await dispatch(suggestPriority({ description, deadline }));
    setHasGenerated(true);
  };

  const isDataValid = description && description.trim().length >= 10 && deadline;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FaLightbulb className="text-green-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-green-800">AI Priority Suggestion</h3>
        </div>
        
        <button
          onClick={handleSuggestPriority}
          disabled={!isDataValid || loading.prioritySuggestion}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !isDataValid || loading.prioritySuggestion
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading.prioritySuggestion ? (
            <div className="flex items-center">
              <FaSpinner className="animate-spin mr-2" size={14} />
              Analyzing...
            </div>
          ) : (
            'Suggest Priority'
          )}
        </button>
      </div>

      {!isDataValid && (
        <div className="flex items-center text-amber-600 text-sm mb-3">
          <FaExclamationTriangle className="mr-2" size={14} />
          Please provide both task description (min 10 characters) and deadline for priority suggestion.
        </div>
      )}

      {errors.prioritySuggestion && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex items-center text-red-700">
            <FaExclamationTriangle className="mr-2" size={16} />
            <span className="text-sm">{errors.prioritySuggestion}</span>
          </div>
        </div>
      )}

      {prioritySuggestion && hasGenerated && (
        <div className="bg-white border border-green-200 rounded-md p-4">
          <h4 className="font-medium text-gray-800 mb-2">AI Priority Recommendation:</h4>
          <p className="text-gray-700 leading-relaxed">{prioritySuggestion}</p>
        </div>
      )}

      {!prioritySuggestion && !loading.prioritySuggestion && !errors.prioritySuggestion && isDataValid && (
        <div className="text-gray-600 text-sm">
          Click "Suggest Priority" to get an AI-powered priority recommendation based on your task details.
        </div>
      )}
    </div>
  );
};

export default AIPriorityHelper;
