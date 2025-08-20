import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkDeadline, clearError } from '../redux/aiSlice';
import { FaRobot, FaSpinner, FaExclamationTriangle, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AIDeadlineChecker = ({ description, deadline, complexity = 'Moderate' }) => {
  const dispatch = useDispatch();
  const { deadlineFeasibility, loading, errors } = useSelector(state => state.ai);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleCheckDeadline = async () => {
    if (!description || !deadline) {
      return;
    }
    
    dispatch(clearError({ feature: 'deadlineFeasibility' }));
    await dispatch(checkDeadline({ description, deadline, complexity }));
    setHasGenerated(true);
  };

  const isDataValid = description && description.trim().length >= 10 && deadline;

  const getStatusIcon = () => {
    if (!deadlineFeasibility) return null;
    
    const status = deadlineFeasibility.toLowerCase();
    if (status.includes('realistic')) {
      return <FaCheckCircle className="text-green-500" size={16} />;
    } else if (status.includes('tight')) {
      return <FaExclamationTriangle className="text-yellow-500" size={16} />;
    } else if (status.includes('unrealistic')) {
      return <FaTimesCircle className="text-red-500" size={16} />;
    }
    return <FaClock className="text-blue-500" size={16} />;
  };

  const getStatusColor = () => {
    if (!deadlineFeasibility) return 'border-orange-200 bg-orange-50';
    
    const status = deadlineFeasibility.toLowerCase();
    if (status.includes('realistic')) {
      return 'border-green-200 bg-green-50';
    } else if (status.includes('tight')) {
      return 'border-yellow-200 bg-yellow-50';
    } else if (status.includes('unrealistic')) {
      return 'border-red-200 bg-red-50';
    }
    return 'border-orange-200 bg-orange-50';
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FaClock className="text-orange-600 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-orange-800">AI Deadline Analysis</h3>
        </div>
        
        <button
          onClick={handleCheckDeadline}
          disabled={!isDataValid || loading.deadlineFeasibility}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            !isDataValid || loading.deadlineFeasibility
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {loading.deadlineFeasibility ? (
            <div className="flex items-center">
              <FaSpinner className="animate-spin mr-2" size={14} />
              Analyzing...
            </div>
          ) : (
            'Check Deadline'
          )}
        </button>
      </div>

      {!isDataValid && (
        <div className="flex items-center text-amber-600 text-sm mb-3">
          <FaExclamationTriangle className="mr-2" size={14} />
          Please provide both task description (min 10 characters) and deadline for feasibility analysis.
        </div>
      )}

      {errors.deadlineFeasibility && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex items-center text-red-700">
            <FaExclamationTriangle className="mr-2" size={16} />
            <span className="text-sm">{errors.deadlineFeasibility}</span>
          </div>
        </div>
      )}

      {deadlineFeasibility && hasGenerated && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <div className="flex items-center mb-2">
            {getStatusIcon()}
            <h4 className="font-medium text-gray-800 ml-2">Deadline Feasibility Analysis:</h4>
          </div>
          <p className="text-gray-700 leading-relaxed">{deadlineFeasibility}</p>
        </div>
      )}

      {!deadlineFeasibility && !loading.deadlineFeasibility && !errors.deadlineFeasibility && isDataValid && (
        <div className="text-gray-600 text-sm">
          Click "Check Deadline" to get an AI analysis of whether your deadline is realistic.
        </div>
      )}
    </div>
  );
};

export default AIDeadlineChecker;
