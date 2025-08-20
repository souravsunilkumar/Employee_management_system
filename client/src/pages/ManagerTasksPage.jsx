import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchTasksByManager, clearError, deleteTask } from '../redux/taskSlice';
import { FaPlus, FaEye, FaCalendarAlt, FaUser, FaExclamationTriangle, FaEdit, FaTrash } from 'react-icons/fa';
import EditTaskModal from '../components/EditTaskModal';

const ManagerTasksPage = () => {
    const dispatch = useDispatch();
    const { tasks, loading, error, deleteLoading } = useSelector(state => state.tasks);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: ''
    });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        dispatch(fetchTasksByManager());
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
                task.assignedTo.name.toLowerCase().includes(searchTerm) ||
                task.assignedTo.empId.toLowerCase().includes(searchTerm)
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

    const getTaskStats = () => {
        const stats = {
            total: tasks.length,
            pending: tasks.filter(task => task.status === 'Pending').length,
            inProgress: tasks.filter(task => task.status === 'In Progress').length,
            completed: tasks.filter(task => task.status === 'Completed').length,
            reviewed: tasks.filter(task => task.status === 'Reviewed').length,
            overdue: tasks.filter(task => isOverdue(task.deadline, task.status)).length
        };
        return stats;
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setEditModalOpen(true);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            try {
                const result = await dispatch(deleteTask(taskId));
                if (deleteTask.fulfilled.match(result)) {
                    toast.success('Task deleted successfully');
                }
            } catch (error) {
                toast.error('Failed to delete task');
            }
        }
    };

    const handleEditSuccess = () => {
        toast.success('Task updated successfully');
        dispatch(fetchTasksByManager());
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
                    <p className="text-gray-600">Manage and track tasks assigned to your team</p>
                </div>
                <Link
                    to="/manager/assign-task"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FaPlus />
                    Assign New Task
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
                    <div className="text-2xl font-bold text-purple-600">{stats.reviewed}</div>
                    <div className="text-sm text-gray-600">Reviewed</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search tasks or employees..."
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

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredTasks.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <FaExclamationTriangle size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-600 mb-4">
                            {tasks.length === 0 
                                ? "You haven't assigned any tasks yet." 
                                : "No tasks match your current filters."
                            }
                        </p>
                        {tasks.length === 0 && (
                            <Link
                                to="/manager/assign-task"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaPlus />
                                Assign Your First Task
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Task
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTasks.map((task) => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {task.title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {task.taskId}
                                                </div>
                                                {task.description && (
                                                    <div className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                                                        {task.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {task.assignedTo.image ? (
                                                    <img
                                                        src={task.assignedTo.image}
                                                        alt={task.assignedTo.name}
                                                        className="w-8 h-8 rounded-full mr-3"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                        <FaUser className="text-blue-600 text-sm" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {task.assignedTo.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {task.assignedTo.empId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <FaCalendarAlt className="text-gray-400 mr-2" />
                                                <div>
                                                    <div className={`text-sm ${isOverdue(task.deadline, task.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                                        {formatDate(task.deadline)}
                                                    </div>
                                                    {isOverdue(task.deadline, task.status) && (
                                                        <div className="text-xs text-red-500">Overdue</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/manager/task/${task._id}`}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleEditTask(task)}
                                                    className="text-green-600 hover:text-green-800 transition-colors p-1"
                                                    title="Edit Task"
                                                    disabled={task.status === 'Reviewed'}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                    title="Delete Task"
                                                    disabled={deleteLoading}
                                                >
                                                    <FaTrash />
                                                </button>
                                                {task.status === 'Completed' && (
                                                    <Link
                                                        to={`/manager/review-task/${task._id}`}
                                                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs hover:bg-purple-200 transition-colors ml-1"
                                                    >
                                                        Review
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Task Modal */}
            <EditTaskModal
                task={selectedTask}
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedTask(null);
                }}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
};

export default ManagerTasksPage;
