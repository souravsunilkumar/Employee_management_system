import React from 'react'
import { FaUsersLine, FaUserPlus, FaUserCheck } from 'react-icons/fa6'
import { FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { useSelector } from 'react-redux'
import { AuthSlicePath } from '../redux/slice/auth.slice'
import { Link } from 'react-router-dom'

const DashboardPage = () => {
    const authUser = useSelector(AuthSlicePath)
    const totalEmployees = authUser?.total_emp || 0

    return (
        <div className="container-custom py-8">
            {/* Welcome section */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white rounded-2xl">
                <h1 className="text-2xl md:text-3xl font-pbold text-white mb-2">
                    Welcome back, {authUser?.name || 'User'}!
                </h1>
                <p className="text-white/90">
                    Here's an overview of your employee management system.
                </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Employees Card */}
                <div className="card p-6 flex items-center transition-transform hover:scale-105">
                    <div className="rounded-full bg-primary/10 p-4 mr-4">
                        <FaUsersLine className="text-primary text-xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-pmedium">Total Employees</h3>
                        <p className="text-2xl font-pbold">{totalEmployees}</p>
                    </div>
                </div>

                {/* Active Employees Card */}
                <div className="card p-6 flex items-center transition-transform hover:scale-105">
                    <div className="rounded-full bg-green-100 p-4 mr-4">
                        <FaUserCheck className="text-green-500 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-pmedium">Active Employees</h3>
                        <p className="text-2xl font-pbold">{totalEmployees}</p>
                    </div>
                </div>

                {/* This Month Card */}
                <div className="card p-6 flex items-center transition-transform hover:scale-105">
                    <div className="rounded-full bg-blue-100 p-4 mr-4">
                        <FiCalendar className="text-blue-500 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-pmedium">This Month</h3>
                        <p className="text-2xl font-pbold">{new Date().toLocaleString('default', { month: 'long' })}</p>
                    </div>
                </div>

                {/* Growth Card */}
                <div className="card p-6 flex items-center transition-transform hover:scale-105">
                    <div className="rounded-full bg-purple-100 p-4 mr-4">
                        <FiTrendingUp className="text-purple-500 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm font-pmedium">Growth</h3>
                        <p className="text-2xl font-pbold">+{Math.floor(Math.random() * 10) + 1}%</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-psmbold mb-4 text-gray-800">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link to="/add-employee" className="card p-6 flex items-center hover:shadow-md transition-all">
                        <div className="rounded-full bg-primary/10 p-3 mr-4">
                            <FaUserPlus className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-pmedium text-gray-800">Add New Employee</h3>
                            <p className="text-sm text-gray-500">Create a new employee record</p>
                        </div>
                    </Link>

                    <Link to="/all-employees" className="card p-6 flex items-center hover:shadow-md transition-all">
                        <div className="rounded-full bg-primary/10 p-3 mr-4">
                            <FaUsersLine className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-pmedium text-gray-800">View All Employees</h3>
                            <p className="text-sm text-gray-500">Manage your employee records</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Activity Section (Placeholder) */}
            <div>
                <h2 className="text-xl font-psmbold mb-4 text-gray-800">Recent Activity</h2>
                <div className="card p-6">
                    <p className="text-gray-500 text-center py-8">No recent activity to display</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage