import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { createTask, fetchEmployeesForAssignment, clearError } from '../redux/taskSlice';
import CustomLoaderButton from '../components/CustomLoaderButton';
import AITaskSummary from '../components/AITaskSummary';
import AIPriorityHelper from '../components/AIPriorityHelper';
import AIDeadlineChecker from '../components/AIDeadlineChecker';
import { FaUser, FaCalendarAlt, FaExclamationTriangle, FaFileUpload, FaRobot } from 'react-icons/fa';

const AssignTaskPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { employeesForAssignment, createLoading, error } = useSelector(state => state.tasks);
    const [attachmentUrls, setAttachmentUrls] = useState(['']);

    useEffect(() => {
        dispatch(fetchEmployeesForAssignment());
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

    const initialValues = {
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        deadline: '',
    };

    const validationSchema = Yup.object({
        title: Yup.string().required('Task title is required').trim(),
        description: Yup.string().trim(),
        assignedTo: Yup.string().required('Please select an employee'),
        priority: Yup.string().oneOf(['Low', 'Medium', 'High']).required('Priority is required'),
        deadline: Yup.date().required('Deadline is required').min(new Date(), 'Deadline must be in the future'),
    });

    const handleSubmit = async (values, { resetForm }) => {
        try {
            const taskData = {
                ...values,
                attachments: attachmentUrls.filter(url => url.trim() !== ''),
            };

            const result = await dispatch(createTask(taskData));
            if (createTask.fulfilled.match(result)) {
                toast.success('Task assigned successfully');
                resetForm();
                setAttachmentUrls(['']);
                navigate('/manager/tasks');
            }
        } catch (error) {
            toast.error('Failed to assign task');
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
                    <h2 className="text-2xl font-bold">Assign New Task</h2>
                    <p className="text-blue-100 mt-1">Create and assign a task to an employee</p>
                </div>

                <div className="p-6">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue }) => (
                            <Form className="space-y-6">
                                {/* Task Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Title <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        id="title"
                                        name="title"
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter task title"
                                    />
                                    <ErrorMessage name="title" component="p" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* Task Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        rows="4"
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
                                        placeholder="Enter task description"
                                    />
                                    <ErrorMessage name="description" component="p" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* AI Task Summary */}
                                {values.description && values.description.trim().length >= 10 && (
                                    <AITaskSummary 
                                        description={values.description}
                                        onSummaryGenerated={(summary) => {
                                            // Optional: You can use the summary for additional processing
                                            console.log('AI Summary generated:', summary);
                                        }}
                                    />
                                )}

                                {/* Employee Assignment */}
                                <div>
                                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign to Employee <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            id="assignedTo"
                                            name="assignedTo"
                                            className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                        >
                                            <option value="">Select an employee</option>
                                            {employeesForAssignment.map((employee) => (
                                                <option key={employee._id} value={employee._id}>
                                                    {employee.name} ({employee.empId})
                                                </option>
                                            ))}
                                        </Field>
                                        <FaUser className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                    </div>
                                    <ErrorMessage name="assignedTo" component="p" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* AI Priority Helper */}
                                {values.description && values.description.trim().length >= 10 && values.deadline && (
                                    <AIPriorityHelper 
                                        description={values.description}
                                        deadline={values.deadline}
                                        onPrioritySuggested={(suggestedPriority) => {
                                            setFieldValue('priority', suggestedPriority);
                                        }}
                                    />
                                )}

                                {/* AI Deadline Checker */}
                                {values.description && values.description.trim().length >= 10 && values.deadline && (
                                    <AIDeadlineChecker 
                                        description={values.description}
                                        deadline={values.deadline}
                                        complexity="Moderate"
                                    />
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Priority */}
                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                            Priority <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Field
                                                as="select"
                                                id="priority"
                                                name="priority"
                                                className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </Field>
                                            <FaExclamationTriangle className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                        </div>
                                        {values.priority && (
                                            <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(values.priority)}`}>
                                                {values.priority} Priority
                                            </div>
                                        )}
                                        <ErrorMessage name="priority" component="p" className="text-red-500 text-xs mt-1" />
                                    </div>

                                    {/* Deadline */}
                                    <div>
                                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                                            Deadline <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Field
                                                type="datetime-local"
                                                id="deadline"
                                                name="deadline"
                                                className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                            <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                                        </div>
                                        <ErrorMessage name="deadline" component="p" className="text-red-500 text-xs mt-1" />
                                    </div>
                                </div>

                                {/* Attachments */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Attachments (URLs)
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
                                        onClick={() => navigate('/manager/dashboard')}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <div className="w-48">
                                        <CustomLoaderButton isLoading={createLoading} text="Assign Task" />
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default AssignTaskPage;
