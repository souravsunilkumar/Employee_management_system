import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateTask, fetchEmployeesForAssignment } from '../redux/taskSlice';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const EditTaskModal = ({ task, isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { employeesForAssignment, updateLoading } = useSelector(state => state.tasks);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchEmployeesForAssignment());
        }
    }, [isOpen, dispatch]);

    const validationSchema = Yup.object({
        title: Yup.string()
            .min(3, 'Title must be at least 3 characters')
            .max(100, 'Title must be less than 100 characters')
            .required('Title is required'),
        description: Yup.string(),
        assignedTo: Yup.string().required('Please select an employee'),
        priority: Yup.string()
            .oneOf(['Low', 'Medium', 'High'], 'Invalid priority')
            .required('Priority is required'),
        deadline: Yup.date()
            .min(new Date(), 'Deadline must be in the future')
            .required('Deadline is required'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const result = await dispatch(updateTask({
                taskId: task._id,
                taskData: {
                    ...values,
                    deadline: new Date(values.deadline).toISOString(),
                }
            }));

            if (updateTask.fulfilled.match(result)) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const initialValues = {
        title: task?.title || '',
        description: task?.description || '',
        assignedTo: task?.assignedTo?._id || '',
        priority: task?.priority || 'Medium',
        deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting, values, setFieldValue }) => (
                            <Form className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Task Title *
                                    </label>
                                    <Field
                                        type="text"
                                        id="title"
                                        name="title"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter task title"
                                    />
                                    <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter task description"
                                    />
                                    <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                {/* Assigned To */}
                                <div>
                                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                                        Assign To *
                                    </label>
                                    <Field
                                        as="select"
                                        id="assignedTo"
                                        name="assignedTo"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select an employee</option>
                                        {employeesForAssignment.map((employee) => (
                                            <option key={employee._id} value={employee._id}>
                                                {employee.name} ({employee.empId})
                                            </option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="assignedTo" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                {/* Priority and Deadline Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Priority */}
                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority *
                                        </label>
                                        <Field
                                            as="select"
                                            id="priority"
                                            name="priority"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </Field>
                                        <ErrorMessage name="priority" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Deadline */}
                                    <div>
                                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                                            Deadline *
                                        </label>
                                        <Field
                                            type="datetime-local"
                                            id="deadline"
                                            name="deadline"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <ErrorMessage name="deadline" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        disabled={isSubmitting || updateLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || updateLoading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {(isSubmitting || updateLoading) && <FaSpinner className="animate-spin" />}
                                        {(isSubmitting || updateLoading) ? 'Updating...' : 'Update Task'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;
