import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { axiosClient } from '../utils/axiosClient';
import { fetchTaskStats } from '../redux/taskSlice';
import AIChatbot from '../components/AIChatbot';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaTasks, FaClock, FaCheckCircle, FaRobot } from 'react-icons/fa';
import CustomLoaderButton from '../components/CustomLoaderButton';
import { Link } from 'react-router-dom';

const EmployeeDashboardPage = () => {
    const dispatch = useDispatch();
    const { taskStats } = useSelector(state => state.tasks);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showChatbot, setShowChatbot] = useState(false);

    useEffect(() => {
        fetchEmployeeProfile();
        dispatch(fetchTaskStats());
    }, [dispatch]);

    const fetchEmployeeProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/profile');
            console.log('Employee profile response:', response.data);
            
            // The profile data is directly in response.data, not in response.data.user
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(error.response?.data?.error || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        mobile: Yup.string().required('Mobile number is required'),
        address: Yup.string().required('Address is required')
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setUpdateLoading(true);
            
            // Only send fields that employees are allowed to update
            const updateData = {
                name: values.name,
                mobile: values.mobile,
                address: values.address
            };
            
            const response = await axiosClient.put('/update-employee-profile', updateData);
            console.log('Profile update response:', response.data);
            
            // Update local state with response data
            // The updated profile data is in response.data or response.data.employee
            setProfile(response.data.employee || response.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setUpdateLoading(false);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6">
                    <h1 className="text-2xl font-bold text-white">Employee Dashboard</h1>
                    <p className="text-blue-100">Welcome back, {profile?.name}</p>
                </div>

                {/* Task Overview Section */}
                {taskStats && (
                    <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">My Tasks Overview</h3>
                            <Link 
                                to="/employee/tasks" 
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View All Tasks
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mx-auto mb-2">
                                    <FaTasks size={16} />
                                </div>
                                <div className="text-xl font-bold text-gray-900">{taskStats.totalTasks || 0}</div>
                                <div className="text-xs text-gray-600">Total Tasks</div>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mx-auto mb-2">
                                    <FaClock size={16} />
                                </div>
                                <div className="text-xl font-bold text-yellow-600">{taskStats.pending || 0}</div>
                                <div className="text-xs text-gray-600">Pending</div>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-2">
                                    <FaClock size={16} />
                                </div>
                                <div className="text-xl font-bold text-blue-600">{taskStats.inProgress || 0}</div>
                                <div className="text-xs text-gray-600">In Progress</div>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-2">
                                    <FaCheckCircle size={16} />
                                </div>
                                <div className="text-xl font-bold text-green-600">{taskStats.completed || 0}</div>
                                <div className="text-xs text-gray-600">Completed</div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Employee Image */}
                        <div className="md:w-1/3 flex flex-col items-center">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 mb-4">
                                {profile?.image ? (
                                    <img 
                                        src={profile.image} 
                                        alt={profile.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-5xl">
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-bold">{profile?.name}</h2>
                                <p className="text-gray-600">{profile?.role}</p>
                                <p className="text-sm text-gray-500 mt-1">ID: {profile?.empId}</p>
                            </div>

                            {/* Change Password Link */}
                            <div className="mt-4">
                                <Link 
                                    to="/employee/change-password" 
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                                >
                                    <span>Change Password</span>
                                </Link>
                            </div>
                        </div>
                        
                        {/* Employee Details Form/View */}
                        <div className="md:w-2/3">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Profile Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <Formik
                                    initialValues={{
                                        name: profile?.name || '',
                                        mobile: profile?.mobile || '',
                                        address: profile?.address || ''
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ isSubmitting }) => (
                                        <Form>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                    <Field
                                                        type="text"
                                                        name="name"
                                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                    <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                                                </div>
                                                
                                                {/* Email (read-only) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <p className="py-2 px-3 bg-gray-100 rounded-lg">{profile?.email}</p>
                                                </div>
                                                
                                                {/* Mobile */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                                                    <Field
                                                        type="text"
                                                        name="mobile"
                                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    />
                                                    <ErrorMessage name="mobile" component="p" className="text-red-500 text-xs mt-1" />
                                                </div>
                                                
                                                {/* Role (read-only) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                                    <p className="py-2 px-3 bg-gray-100 rounded-lg">{profile?.role}</p>
                                                </div>

                                                {/* Salary (read-only) */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                                                    <p className="py-2 px-3 bg-gray-100 rounded-lg">
                                                        {profile?.salary ? `$${profile.salary}` : 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Address */}
                                            <div className="mt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <Field
                                                    as="textarea"
                                                    name="address"
                                                    rows="3"
                                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="mt-6 flex justify-end space-x-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <div className="w-32">
                                                    <CustomLoaderButton isLoading={updateLoading} text="Save" />
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaUser />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                            <p className="text-lg font-medium">{profile?.name}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaEnvelope />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                                            <p className="text-lg font-medium">{profile?.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaPhone />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                                            <p className="text-lg font-medium">{profile?.mobile}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaBriefcase />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-500">Job Role</h3>
                                            <p className="text-lg font-medium">{profile?.role}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaMoneyBillWave />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-500">Salary</h3>
                                            <p className="text-lg font-medium">
                                                {profile?.salary ? `₹${profile.salary}` : profile?.salary === 0 ? '₹0' : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-gray-500">Address</h3>
                                            <p className="text-lg font-medium">{profile?.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* AI Chatbot Toggle Button - Placed below profile information */}
            <div className="container mx-auto px-4 py-4 flex justify-center">
                <button
                    onClick={() => setShowChatbot(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    title="Open AI Assistant"
                >
                    <FaRobot size={20} />
                    <span>Chat with AI Assistant</span>
                </button>
            </div>

            {/* AI Chatbot */}
            <AIChatbot 
                isOpen={showChatbot} 
                onClose={() => setShowChatbot(false)} 
            />
        </>
    );
};

export default EmployeeDashboardPage;
