import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { updateTaskStatus, fetchTasksByEmployee, clearError } from '../redux/taskSlice';
import CustomLoaderButton from '../components/CustomLoaderButton';
import { FaUser, FaCalendarAlt, FaExclamationTriangle, FaArrowLeft, FaFileUpload, FaStar } from 'react-icons/fa';

const TaskDetailsPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tasks, updateLoading, error } = useSelector(state => state.tasks);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attachmentUrls, setAttachmentUrls] = useState(['']);

    useEffect(() => {
        const loadTask = async () => {
            try {
                await dispatch(fetchTasksByEmployee());
                const foundTask = tasks.find(t => t._id === taskId);
                if (foundTask) {
                    setTask(foundTask);
                } else {
                    toast.error('Task not found');
                    navigate('/employee/tasks');
                }
            } catch (error) {
                toast.error('Failed to load task');
                navigate('/employee/tasks');
            } finally {
                setLoading(false);
            }
        };

        loadTask();
    }, [dispatch, taskId, navigate, tasks]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const validationSchema = Yup.object({
        status: Yup.string().oneOf(['Pending', 'In Progress', 'Completed']).required('Status is required'),
    });

    const handleStatusUpdate = async (values) => {
        try {
            const validAttachments = attachmentUrls.filter(url => url.trim() !== '');
            
            const result = await dispatch(updateTaskStatus({
                taskId: task._id,
                status: values.status,
                attachments: validAttachments,
            }));

            if (updateTaskStatus.fulfilled.match(result)) {
                toast.success('Task status updated successfully');
                setTask(result.payload.task);
                setAttachmentUrls(['']);
            }
        } catch (error) {
            toast.error('Failed to update task status');
        }
    };

    const addAttachmentField = () => {
        setAttachmentUrls([...attachmentUrls, '']);
    };

    const removeAttachmentField = (index) => {
        const newUrls = attachmentUrls.filter((_, i) => i !== index);
        setAttachmentUrls(newUrls);
    };

    const updateAttachmentUrl = (index, value) => {
        const newUrls = [...attachmentUrls];
        newUrls[index] = value;
        setAttachmentUrls(newUrls);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

    const isOverdue = (deadline, status) => {
        return new Date(deadline) < new Date() && status !== 'Completed' && status !== 'Reviewed';
    };

    const canUpdateStatus = (currentStatus) => {
        return currentStatus !== 'Reviewed';
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            'Pending': 'In Progress',
            'In Progress': 'Completed',
            'Completed': 'Completed'
        };
        return statusFlow[currentStatus] || currentStatus;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <FaExclamationTriangle className="text-gray-400 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
                    <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/employee/tasks')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to My Tasks
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/employee/tasks')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaArrowLeft />
                        Back to My Tasks
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
                </div>

                {/* Task Details Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
                        <h2 className="text-xl font-bold">{task.title}</h2>
                        <p className="text-blue-100 mt-1">Task ID: {task.taskId}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Manager Info */}
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                    <FaUser className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Assigned by</h3>
                                    <p className="text-sm text-gray-600">{task.assignedBy.name}</p>
                                    <p className="text-xs text-gray-500">{task.assignedBy.email}</p>
                                </div>
                            </div>

                            {/* Task Meta */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(task.priority)}`}>
                                        {task.priority} Priority
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(task.status)}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <FaCalendarAlt className="mr-2" />
                                    <div>
                                        <span className={isOverdue(task.deadline, task.status) ? 'text-red-600 font-medium' : ''}>
                                            Deadline: {formatDate(task.deadline)}
                                        </span>
                                        {isOverdue(task.deadline, task.status) && (
                                            <span className="block text-red-500 text-xs">Overdue</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Created: {formatDate(task.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{task.description}</p>
                            </div>
                        )}

                        {/* Existing Attachments */}
                        {task.attachments && task.attachments.length > 0 && (
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                                <div className="space-y-2">
                                    {task.attachments.map((attachment, index) => (
                                        <a
                                            key={index}
                                            href={attachment}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <span className="text-blue-700 hover:text-blue-800">
                                                Attachment {index + 1}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Review Information */}
                        {task.status === 'Reviewed' && (
                            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <FaStar className="text-yellow-400" />
                                    Manager Review
                                </h4>
                                {task.rating && (
                                    <div className="mb-2">
                                        <span className="text-sm text-gray-600">Rating: </span>
                                        <span className="font-bold text-purple-800">{task.rating}/5</span>
                                        <div className="flex items-center mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FaStar
                                                    key={star}
                                                    className={`text-sm ${star <= task.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {task.feedback && (
                                    <p className="text-gray-700">{task.feedback}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Update Form */}
                {canUpdateStatus(task.status) && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Update Task Status</h3>

                            <Formik
                                initialValues={{ status: task.status }}
                                validationSchema={validationSchema}
                                onSubmit={handleStatusUpdate}
                            >
                                {({ values, setFieldValue }) => (
                                    <Form className="space-y-6">
                                        {/* Status Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Task Status <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                {['Pending', 'In Progress', 'Completed'].map((status) => (
                                                    <label key={status} className="flex items-center">
                                                        <Field
                                                            type="radio"
                                                            name="status"
                                                            value={status}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{status}</span>
                                                        {status === getNextStatus(task.status) && task.status !== status && (
                                                            <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                                Next
                                                            </span>
                                                        )}
                                                    </label>
                                                ))}
                                            </div>
                                            <ErrorMessage name="status" component="p" className="text-red-500 text-xs mt-1" />
                                        </div>

                                        {/* Add Attachments */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Add New Attachments (URLs)
                                            </label>
                                            <div className="space-y-2">
                                                {attachmentUrls.map((url, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input
                                                            type="url"
                                                            value={url}
                                                            onChange={(e) => updateAttachmentUrl(index, e.target.value)}
                                                            className="flex-1 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="Enter file URL"
                                                        />
                                                        {attachmentUrls.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAttachmentField(index)}
                                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addAttachmentField}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <FaFileUpload />
                                                    Add Another Attachment
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end gap-4 pt-6 border-t">
                                            <button
                                                type="button"
                                                onClick={() => navigate('/employee/tasks')}
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <div className="w-48">
                                                <CustomLoaderButton isLoading={updateLoading} text="Update Status" />
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                )}

                {/* Read-only message for reviewed tasks */}
                {task.status === 'Reviewed' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-purple-800 text-center">
                            This task has been reviewed and cannot be modified further.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetailsPage;
