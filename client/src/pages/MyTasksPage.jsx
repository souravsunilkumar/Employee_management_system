import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchTasksByEmployee, clearError } from '../redux/taskSlice';
import { explainTask, suggestResources } from '../redux/aiSlice';
import { FaEye, FaCalendarAlt, FaUser, FaExclamationTriangle, FaFilter, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';

const MyTasksPage = () => {
    const dispatch = useDispatch();
    const { tasks, loading, error } = useSelector(state => state.tasks);
    const { taskExplanation, resourceSuggestions, loading: aiLoading } = useSelector(state => state.ai);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const [selectedTaskForAI, setSelectedTaskForAI] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiModalType, setAiModalType] = useState(''); // 'explain' or 'resources'

    useEffect(() => {
        dispatch(fetchTasksByEmployee());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    useEffect(() => {
        let filtered = [...tasks];

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }

        // Filter by priority
        if (filters.priority !== 'all') {
            filtered = filtered.filter(task => task.priority === filters.priority);
        }

        // Filter by search term
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(searchTerm) ||
                task.taskId.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredTasks(filtered);
    }, [tasks, filters]);

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Pending': 'bg-gray-100 text-gray-800 border-gray-200',
            'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'Completed': 'bg-green-100 text-green-800 border-green-200',
            'Reviewed': 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPriorityBadge = (priority) => {
        const priorityClasses = {
            'High': 'bg-red-100 text-red-800 border-red-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Low': 'bg-green-100 text-green-800 border-green-200'
        };
        return priorityClasses[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (deadline, status) => {
        return new Date(deadline) < new Date() && status !== 'Completed' && status !== 'Reviewed';
    };

    const handleExplainTask = async (taskId) => {
        setSelectedTaskForAI(taskId);
        setAiModalType('explain');
        setShowAIModal(true);
        await dispatch(explainTask(taskId));
    };

    const handleSuggestResources = async (taskId) => {
        setSelectedTaskForAI(taskId);
        setAiModalType('resources');
        setShowAIModal(true);
        await dispatch(suggestResources(taskId));
    };

    const closeAIModal = () => {
        setShowAIModal(false);
        setSelectedTaskForAI(null);
        setAiModalType('');
    };

    const getTaskStats = () => {
        const stats = {
            total: tasks.length,
            pending: tasks.filter(task => task.status === 'Pending').length,
            inProgress: tasks.filter(task => task.status === 'In Progress').length,
            completed: tasks.filter(task => task.status === 'Completed' || task.status === 'Reviewed').length,
            overdue: tasks.filter(task => isOverdue(task.deadline, task.status)).length
        };
        return stats;
    };

    const stats = getTaskStats();

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                <p className="text-gray-600">View and manage your assigned tasks</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <FaFilter className="text-gray-500" />
                    <h3 className="font-medium text-gray-900">Filter Tasks</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Reviewed">Reviewed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters({...filters, priority: e.target.value})}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ status: 'all', priority: 'all', search: '' })}
                            className="w-full py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.length === 0 ? (
                    <div className="col-span-full">
                        <div className="bg-white p-8 rounded-lg shadow text-center">
                            <div className="text-gray-400 mb-4">
                                <FaExclamationTriangle size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                            <p className="text-gray-600">
                                {tasks.length === 0 
                                    ? "You don't have any tasks assigned yet." 
                                    : "No tasks match your current filters."
                                }
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                {/* Task Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{task.taskId}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Task Description */}
                                {task.description && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {task.description}
                                    </p>
                                )}

                                {/* Assigned By */}
                                <div className="flex items-center mb-4">
                                    <FaUser className="text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Assigned by: <span className="font-medium">{task.assignedBy.name}</span>
                                    </span>
                                </div>

                                {/* Deadline */}
                                <div className="flex items-center mb-4">
                                    <FaCalendarAlt className="text-gray-400 mr-2" />
                                    <div>
                                        <span className={`text-sm ${isOverdue(task.deadline, task.status) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                            {formatDate(task.deadline)}
                                        </span>
                                        {isOverdue(task.deadline, task.status) && (
                                            <span className="block text-xs text-red-500">Overdue</span>
                                        )}
                                    </div>
                                </div>

                                {/* Review Info */}
                                {task.status === 'Reviewed' && task.rating && (
                                    <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-purple-800">Reviewed</span>
                                            <div className="flex items-center">
                                                <span className="text-sm text-purple-600 mr-1">Rating:</span>
                                                <span className="text-sm font-bold text-purple-800">{task.rating}/5</span>
                                            </div>
                                        </div>
                                        {task.feedback && (
                                            <p className="text-sm text-purple-700 mt-2">{task.feedback}</p>
                                        )}
                                    </div>
                                )}

                                {/* AI Helper Buttons */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => handleExplainTask(task._id)}
                                        className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200 transition-colors text-xs"
                                        title="Get AI explanation of this task"
                                    >
                                        <FaRobot size={12} />
                                        Explain Task
                                    </button>
                                    <button
                                        onClick={() => handleSuggestResources(task._id)}
                                        className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-200 transition-colors text-xs"
                                        title="Get AI resource suggestions"
                                    >
                                        <FaLightbulb size={12} />
                                        Need Help?
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="text-xs text-gray-500">
                                        Created: {formatDate(task.createdAt)}
                                    </div>
                                    <Link
                                        to={`/employee/task/${task._id}`}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <FaEye />
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* AI Modal */}
            {showAIModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    {aiModalType === 'explain' ? (
                                        <>
                                            <FaRobot className="mr-2 text-green-600" />
                                            AI Task Explanation
                                        </>
                                    ) : (
                                        <>
                                            <FaLightbulb className="mr-2 text-purple-600" />
                                            AI Resource Suggestions
                                        </>
                                    )}
                                </h3>
                                <button
                                    onClick={closeAIModal}
                                    className="text-gray-400 hover:text-gray-600 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(aiLoading.taskExplanation || aiLoading.resourceSuggestions) && (
                                    <div className="flex items-center justify-center py-8">
                                        <FaSpinner className="animate-spin mr-2 text-blue-500" size={20} />
                                        <span className="text-gray-600">AI is analyzing your task...</span>
                                    </div>
                                )}

                                {aiModalType === 'explain' && taskExplanation && !aiLoading.taskExplanation && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="font-medium text-green-800 mb-2">Task Explanation:</h4>
                                        <p className="text-green-700 leading-relaxed">{taskExplanation}</p>
                                    </div>
                                )}

                                {aiModalType === 'resources' && resourceSuggestions && !aiLoading.resourceSuggestions && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h4 className="font-medium text-purple-800 mb-2">Resource Suggestions:</h4>
                                        <div className="text-purple-700 leading-relaxed whitespace-pre-line">
                                            {resourceSuggestions}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={closeAIModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTasksPage;
