import React, { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaHome, FaKey } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { axiosClient } from '../utils/axiosClient'
import { useMainContext } from '../context/mainContext'

const EmployeeLayout = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { user, setUser } = useMainContext()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token')
                const userType = localStorage.getItem('userType')
                
                if (!token || userType !== 'employee') {
                    navigate('/login')
                    return
                }
                
                // Verify token and get user profile
                await axiosClient.get('/profile')
                setLoading(false)
            } catch (error) {
                console.error('Auth error:', error)
                localStorage.removeItem('token')
                localStorage.removeItem('userType')
                localStorage.removeItem('role')
                navigate('/login')
            }
        }
        
        checkAuth()
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userType')
        localStorage.removeItem('role')
        setUser(null)
        navigate('/login')
        toast.success('Logged out successfully')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar for larger screens */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-blue-800 text-white">
                <div className="flex items-center justify-center h-16 bg-blue-900">
                    <h2 className="text-xl font-bold">Employee Portal</h2>
                </div>
                
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        <Link to="/employee/dashboard" className="flex items-center px-4 py-3 text-white hover:bg-blue-700 rounded-md transition-colors">
                            <FaHome className="mr-3" />
                            Dashboard
                        </Link>
                        <Link to="/employee/change-password" className="flex items-center px-4 py-3 text-white hover:bg-blue-700 rounded-md transition-colors">
                            <FaKey className="mr-3" />
                            Change Password
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-white hover:bg-blue-700 rounded-md transition-colors">
                            <FaSignOutAlt className="mr-3" />
                            Logout
                        </button>
                    </nav>
                </div>
                
                <div className="p-4 border-t border-blue-700">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <FaUser />
                        </div>
                        <div className="ml-3">
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-sm text-blue-200">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile sidebar */}
            <div className="md:hidden">
                <div className="fixed top-0 left-0 right-0 z-10 bg-blue-800 text-white flex items-center justify-between p-4">
                    <h2 className="text-xl font-bold">Employee Portal</h2>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
                
                {isOpen && (
                    <div className="fixed inset-0 z-20 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
                        <div className="absolute top-0 left-0 bottom-0 w-64 bg-blue-800 text-white" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between h-16 bg-blue-900 px-4">
                                <h2 className="text-xl font-bold">Employee Portal</h2>
                                <button onClick={() => setIsOpen(false)} className="p-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <nav className="px-2 py-4 space-y-1">
                                <Link to="/employee/dashboard" className="flex items-center px-4 py-3 text-white hover:bg-blue-700 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                                    <FaHome className="mr-3" />
                                    Dashboard
                                </Link>
                                <Link to="/employee/change-password" className="flex items-center px-4 py-3 text-white hover:bg-blue-700 rounded-md transition-colors" onClick={() => setIsOpen(false)}>
                                    <FaKey className="mr-3" />
                                    Change Password
                                </Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full flex items-center px-4 py-3 text-white hover:bg-blue-700 rounded-md transition-colors">
                                    <FaSignOutAlt className="mr-3" />
                                    Logout
                                </button>
                            </nav>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                        <FaUser />
                                    </div>
                                    <div className="ml-3">
                                        <p className="font-medium">{user?.name}</p>
                                        <p className="text-sm text-blue-200">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Main content */}
            <div className="md:ml-64 flex-1">
                <div className="py-16 md:py-6 px-4">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default EmployeeLayout
