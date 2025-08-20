import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { axiosClient } from '../utils/axiosClient';
import { fetchTaskStats } from '../redux/taskSlice';
import { analyzeBottlenecks, simulateWorkloadChange } from '../redux/aiSlice';
import { FaUsers, FaUserPlus, FaChartLine, FaCalendarAlt, FaUserEdit, FaTasks, FaClipboardCheck, FaClock, FaRobot, FaSpinner } from 'react-icons/fa';

const ManagerDashboardPage = () => {
    const dispatch = useDispatch();
    const { taskStats } = useSelector(state => state.tasks);
    const { bottleneckAnalysis, workloadSimulation, loading: aiLoading, errors } = useSelector(state => state.ai);
    console.log('Redux AI state:', { bottleneckAnalysis, aiLoading, errors });
    // Add useEffect to show toast when errors change
    useEffect(() => {
        if (errors?.bottleneckAnalysis) {
            toast.error(errors.bottleneckAnalysis);
        }
    }, [errors?.bottleneckAnalysis]);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        departmentCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [showAIInsights, setShowAIInsights] = useState(false);

    useEffect(() => {
        fetchManagerProfile();
        dispatch(fetchTaskStats());
    }, [dispatch]);

    const handleAnalyzeBottlenecks = async () => {
        console.log('Start Analysis button clicked');
        console.log('Profile:', profile);
        
        if (profile) {
            try {
                // From the console log you shared, we can see the user ID isn't available as 'id'
                // Let's modify the aiSlice.js analyzeBottlenecks action to use the email as identifier
                // since that's what we have available in the profile object
                console.log('Dispatching analyzeBottlenecks with email:', profile.email);
                await dispatch(analyzeBottlenecks(profile.email));
                console.log('analyzeBottlenecks dispatched successfully');
                setShowAIInsights(true);
            } catch (error) {
                console.error('Error in analyzeBottlenecks:', error);
                toast.error('Failed to analyze bottlenecks. Please try again.');
            }
        } else {
            console.error('Profile data is missing, cannot analyze bottlenecks');
            toast.warning('Unable to analyze bottlenecks: Profile data is missing');
        }
    };

    const fetchManagerProfile = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/profile');
            console.log('Profile response:', response.data);
            
            // The profile data is directly in response.data, not in response.data.user
            setProfile(response.data);
            
            // Set stats from profile response
            setStats({
                totalEmployees: response.data.total_emp || 0,
                activeEmployees: response.data.total_emp || 0,
                departmentCount: 1
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error(error.response?.data?.error || 'Failed to load profile');
        } finally {
            setLoading(false);
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
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                    <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
                    <p className="text-blue-100">Welcome back, {profile?.name}</p>
                </div>
                
                <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500">
                            {profile?.image ? (
                                <img 
                                    src={profile.image} 
                                    alt={profile.name} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl">
                                    {profile?.name?.charAt(0).toUpperCase() || 'M'}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{profile?.name}</h2>
                            <p className="text-gray-600">{profile?.email}</p>
                            <p className="text-gray-500 mt-1">Manager</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Total Employees</p>
                        <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                        <FaUserPlus size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Active Employees</p>
                        <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                        <FaChartLine size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Departments</p>
                        <p className="text-2xl font-bold">{stats.departmentCount}</p>
                    </div>
                </div>
            </div>

            {/* Task Overview Section */}
            {taskStats && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Task Overview</h2>
                            <Link 
                                to="/manager/tasks" 
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View All Tasks
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mx-auto mb-2">
                                    <FaTasks size={20} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{taskStats.totalAssigned || 0}</div>
                                <div className="text-sm text-gray-600">Total Assigned</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mx-auto mb-2">
                                    <FaClock size={20} />
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">{taskStats.pendingReview || 0}</div>
                                <div className="text-sm text-gray-600">Pending Review</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-2">
                                    <FaClock size={20} />
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress || 0}</div>
                                <div className="text-sm text-gray-600">In Progress</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-2">
                                    <FaClipboardCheck size={20} />
                                </div>
                                <div className="text-2xl font-bold text-green-600">{taskStats.completed || 0}</div>
                                <div className="text-sm text-gray-600">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium">Quick Actions</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Link to="/manager/assign-task" className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                            <FaTasks size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Assign Task</span>
                    </Link>
                    
                    <Link to="/manager/tasks" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
                            <FaClipboardCheck size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Manage Tasks</span>
                    </Link>
                    
                    <Link to="/manager/add-employee" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                            <FaUserPlus size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Add Employee</span>
                    </Link>
                    
                    <Link to="/manager/employees" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
                            <FaUsers size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">View Employees</span>
                    </Link>
                    
                    <Link to="/profile" className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-3">
                            <FaUserEdit size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Edit Profile</span>
                    </Link>
                    
                    <Link to="/calendar" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
                            <FaCalendarAlt size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Calendar</span>
                    </Link>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg shadow-md overflow-hidden mb-8">
                <div className="border-b border-purple-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FaRobot className="text-purple-600 mr-2" size={20} />
                            <h2 className="text-lg font-medium text-purple-800">AI-Powered Insights</h2>
                        </div>
                        <button
                            onClick={handleAnalyzeBottlenecks}
                            disabled={aiLoading.bottleneckAnalysis}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                aiLoading.bottleneckAnalysis
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                        >
                            {aiLoading.bottleneckAnalysis ? (
                                <div className="flex items-center">
                                    <FaSpinner className="animate-spin mr-2" size={14} />
                                    Analyzing...
                                </div>
                            ) : (
                                'Analyze Team Performance'
                            )}
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {!showAIInsights && !bottleneckAnalysis && (
                        <div className="text-center py-8">
                            <FaRobot className="mx-auto mb-4 text-purple-400" size={48} />
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Get AI-Powered Team Insights</h3>
                            <p className="text-gray-600 mb-4">
                                Analyze your team's workload distribution, identify bottlenecks, and get recommendations for better task management.
                            </p>
                            
                            {/* Error Alert Banner */}
                            {errors?.bottleneckAnalysis && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-auto max-w-lg text-left" role="alert">
                                    <div className="flex items-center">
                                        <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <p className="font-bold">Service Unavailable</p>
                                    </div>
                                    <p className="mt-1">{errors.bottleneckAnalysis}</p>
                                    {errors.bottleneckAnalysis.includes('temporarily offline') && (
                                        <p className="mt-2 font-medium">
                                            The AI service is temporarily unavailable due to usage limits. Please try again later.
                                        </p>
                                    )}
                                    {errors.bottleneckAnalysis.includes('AI service') && !errors.bottleneckAnalysis.includes('temporarily offline') && (
                                        <p className="mt-2 font-medium">
                                            This feature requires an OpenAI API key to be configured on the server.
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            <button
                                onClick={handleAnalyzeBottlenecks}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                disabled={aiLoading?.bottleneckAnalysis}
                            >
                                {aiLoading?.bottleneckAnalysis ? (
                                    <>
                                        <FaSpinner className="animate-spin inline mr-2" />
                                        Analyzing...
                                    </>
                                ) : 'Start Analysis'}
                            </button>
                        </div>
                    )}


                    
                    {bottleneckAnalysis && (
                        <div className="bg-white rounded-lg border border-purple-200 p-4">
                            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                                <FaChartLine className="mr-2 text-purple-600" />
                                Team Bottleneck Analysis
                            </h3>
                            <p className="text-gray-700 leading-relaxed">{bottleneckAnalysis}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium">Recent Activity</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {/* This would be populated from an API call in a real application */}
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <FaUserPlus />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">New employee added</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <FaUserEdit />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">Employee profile updated</p>
                                <p className="text-xs text-gray-500">Yesterday</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <FaChartLine />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">Monthly report generated</p>
                                <p className="text-xs text-gray-500">3 days ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboardPage;
