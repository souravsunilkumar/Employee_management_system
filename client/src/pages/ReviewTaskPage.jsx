import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { reviewTask, fetchTasksByManager, clearError } from '../redux/taskSlice';
import CustomLoaderButton from '../components/CustomLoaderButton';
import { FaStar, FaUser, FaCalendarAlt, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const ReviewTaskPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tasks, reviewLoading, error } = useSelector(state => state.tasks);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTask = async () => {
            try {
                await dispatch(fetchTasksByManager());
                const foundTask = tasks.find(t => t._id === taskId);
                if (foundTask) {
                    setTask(foundTask);
                } else {
                    toast.error('Task not found');
                    navigate('/manager/tasks');
                }
            } catch (error) {
                toast.error('Failed to load task');
                navigate('/manager/tasks');
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

    const initialValues = {
        feedback: task?.feedback || '',
        rating: task?.rating || 5,
    };

    const validationSchema = Yup.object({
        feedback: Yup.string().trim(),
        rating: Yup.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').required('Rating is required'),
    });

    const handleSubmit = async (values) => {
        try {
            const result = await dispatch(reviewTask({
                taskId: task._id,
                feedback: values.feedback,
                rating: values.rating,
            }));

            if (reviewTask.fulfilled.match(result)) {
                toast.success('Task reviewed successfully');
                navigate('/manager/tasks');
            }
        } catch (error) {
            toast.error('Failed to review task');
        }
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

    const StarRating = ({ rating, onRatingChange, disabled = false }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !disabled && onRatingChange && onRatingChange(star)}
                        className={`text-2xl transition-colors ${
                            star <= rating 
                                ? 'text-yellow-400 hover:text-yellow-500' 
                                : 'text-gray-300 hover:text-gray-400'
                        } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                        disabled={disabled}
                    >
                        <FaStar />
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
            </div>
        );
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
                        onClick={() => navigate('/manager/tasks')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Tasks
                    </button>
                </div>
            </div>
        );
    }

    if (task.status !== 'Completed' && task.status !== 'Reviewed') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <FaExclamationTriangle className="text-yellow-400 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Ready for Review</h2>
                    <p className="text-gray-600 mb-4">This task must be completed before it can be reviewed.</p>
                    <button
                        onClick={() => navigate('/manager/tasks')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Tasks
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
                        onClick={() => navigate('/manager/tasks')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <FaArrowLeft />
                        Back to Tasks
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Review Task</h1>
                </div>

                {/* Task Details Card */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6 text-white">
                        <h2 className="text-xl font-bold">{task.title}</h2>
                        <p className="text-purple-100 mt-1">Task ID: {task.taskId}</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Employee Info */}
                            <div className="flex items-center">
                                {task.assignedTo.image ? (
                                    <img
                                        src={task.assignedTo.image}
                                        alt={task.assignedTo.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <FaUser className="text-blue-600" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-900">{task.assignedTo.name}</h3>
                                    <p className="text-sm text-gray-600">{task.assignedTo.empId}</p>
                                </div>
                            </div>

                            {/* Task Meta */}
                            <div className="space-y-2">
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
                                    Deadline: {formatDate(task.deadline)}
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

                        {/* Attachments */}
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

                        {/* Existing Review (if already reviewed) */}
                        {task.status === 'Reviewed' && task.feedback && (
                            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Previous Review</h4>
                                <div className="mb-2">
                                    <StarRating rating={task.rating} disabled={true} />
                                </div>
                                <p className="text-gray-700">{task.feedback}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Form */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {task.status === 'Reviewed' ? 'Update Review' : 'Provide Review'}
                        </h3>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize={true}
                        >
                            {({ values, setFieldValue }) => (
                                <Form className="space-y-6">
                                    {/* Rating */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rating <span className="text-red-500">*</span>
                                        </label>
                                        <StarRating
                                            rating={values.rating}
                                            onRatingChange={(rating) => setFieldValue('rating', rating)}
                                        />
                                        <ErrorMessage name="rating" component="p" className="text-red-500 text-xs mt-1" />
                                    </div>

                                    {/* Feedback */}
                                    <div>
                                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                                            Feedback
                                        </label>
                                        <Field
                                            as="textarea"
                                            id="feedback"
                                            name="feedback"
                                            rows="4"
                                            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-vertical"
                                            placeholder="Provide feedback on the task completion..."
                                        />
                                        <ErrorMessage name="feedback" component="p" className="text-red-500 text-xs mt-1" />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-4 pt-6 border-t">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/manager/tasks')}
                                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <div className="w-48">
                                            <CustomLoaderButton 
                                                isLoading={reviewLoading} 
                                                text={task.status === 'Reviewed' ? 'Update Review' : 'Submit Review'} 
                                            />
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewTaskPage;
