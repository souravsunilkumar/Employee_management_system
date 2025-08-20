import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateTaskSummary, clearError } from '../redux/aiSlice';
import { FaRobot, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const AITaskSummary = ({ description, onSummaryGenerated }) => {
  const dispatch = useDispatch();
  const { taskSummary, loading, errors } = useSelector(state => state.ai);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (taskSummary && onSummaryGenerated) {
      onSummaryGenerated(taskSummary);
    }
  }, [taskSummary, onSummaryGenerated]);

  const handleGenerateSummary = async () => {
    if (!description || description.trim().length < 10) {
      return;
    }
    
    dispatch(clearError({ feature: 'taskSummary' }));
    await dispatch(generateTaskSummary(description));
    setHasGenerated(true);
  };

  const isDescriptionValid = description && description.trim().length >= 10;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FaRobot className="text-blue-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-blue-800">AI Task Summary</h3>
        </div>
        
        <button
          onClick={handleGenerateSummary}
          disabled={!isDescriptionValid || loading.taskSummary}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !isDescriptionValid || loading.taskSummary
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading.taskSummary ? (
            <div className="flex items-center">
              <FaSpinner className="animate-spin mr-2" size={14} />
              Generating...
            </div>
          ) : (
            'Generate Summary'
          )}
        </button>
      </div>

      {!isDescriptionValid && (
        <div className="flex items-center text-amber-600 text-sm mb-3">
          <FaExclamationTriangle className="mr-2" size={14} />
          Please provide a task description with at least 10 characters to generate a summary.
        </div>
      )}

      {errors.taskSummary && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex items-center text-red-700">
            <FaExclamationTriangle className="mr-2" size={16} />
            <span className="text-sm">{errors.taskSummary}</span>
          </div>
        </div>
      )}

      {taskSummary && hasGenerated && (
        <div className="bg-white border border-blue-200 rounded-md p-4">
          <h4 className="font-medium text-gray-800 mb-2">AI-Generated Summary:</h4>
          <p className="text-gray-700 leading-relaxed">{taskSummary}</p>
        </div>
      )}

      {!taskSummary && !loading.taskSummary && !errors.taskSummary && isDescriptionValid && (
        <div className="text-gray-600 text-sm">
          Click "Generate Summary" to get an AI-powered summary of your task description.
        </div>
      )}
    </div>
  );
};

export default AITaskSummary;
