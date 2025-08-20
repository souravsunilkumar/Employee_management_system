import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosClient } from '../utils/axiosClient';
import { FaUsers, FaUserPlus, FaChartLine, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';

const ManagerDashboardPage = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        departmentCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchManagerProfile();
    }, []);

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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium">Quick Actions</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/add-employee" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                            <FaUserPlus size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Add Employee</span>
                    </Link>
                    
                    <Link to="/employees" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
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
                    
                    <Link to="/calendar" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
                            <FaCalendarAlt size={24} />
                        </div>
                        <span className="text-gray-800 font-medium">Calendar</span>
                    </Link>
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
