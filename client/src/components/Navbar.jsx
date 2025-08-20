import React, { useState, useEffect } from 'react'
import LogoComponents from './LogoComponents'
import { Link, useLocation } from 'react-router-dom'
import { useMainContext } from '../context/mainContext'
import { FiMenu, FiX } from 'react-icons/fi'

const Navbar = () => {
    const { logoutHandler } = useMainContext()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [userType, setUserType] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    
    useEffect(() => {
        // Check if user is authenticated by looking for token
        const token = localStorage.getItem('token')
        const storedUserType = localStorage.getItem('userType')
        
        setIsAuthenticated(!!token)
        setUserType(storedUserType)
        
        // Add event listener for storage changes to detect logout from other components
        const handleStorageChange = () => {
            const currentToken = localStorage.getItem('token')
            const currentUserType = localStorage.getItem('userType')
            setIsAuthenticated(!!currentToken)
            setUserType(currentUserType)
        }
        
        window.addEventListener('storage', handleStorageChange)
        
        // Custom event for logout
        const handleLogout = () => {
            setIsAuthenticated(false)
            setUserType(null)
        }
        
        window.addEventListener('app-logout', handleLogout)
        
        return () => {
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('app-logout', handleLogout)
        }
    }, [])
    
    const isActive = (path) => {
        return location.pathname === path ? 'text-primary font-psmbold' : 'text-gray-700 hover:text-primary'
    }
    
    return (
        <>
            <header className="w-full bg-white shadow-sm sticky top-0 z-50">
                <div className="container-custom py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <LogoComponents />
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-primary focus:outline-none"
                        >
                            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {/* Manager Navigation Links */}
                        {isAuthenticated && userType === 'manager' && (
                            <>
                                <Link to={'/manager/dashboard'} className={`${isActive('/manager/dashboard')} font-pmedium transition-colors duration-200`}>
                                    Dashboard
                                </Link>
                                <Link to={'/manager/add-employee'} className={`${isActive('/manager/add-employee')} font-pmedium transition-colors duration-200`}>
                                    Add Employee
                                </Link>
                                <Link to={'/manager/employees'} className={`${isActive('/manager/employees')} font-pmedium transition-colors duration-200`}>
                                    All Employees
                                </Link>
                            </>
                        )}
                        
                        {/* Employee Navigation Links */}
                        {isAuthenticated && userType === 'employee' && (
                            <>
                                <Link to={'/employee/dashboard'} className={`${isActive('/employee/dashboard')} font-pmedium transition-colors duration-200`}>
                                    Dashboard
                                </Link>
                                <Link to={'/employee/change-password'} className={`${isActive('/employee/change-password')} font-pmedium transition-colors duration-200`}>
                                    Change Password
                                </Link>
                            </>
                        )}
                        
                        {!isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                <Link to={'/login'} className="btn btn-primary rounded-full px-6">
                                    Login
                                </Link>
                                <Link to={'/register'} className="btn border border-primary text-primary hover:bg-primary hover:text-white rounded-full px-6">
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <button 
                                onClick={logoutHandler} 
                                className="btn btn-danger rounded-full px-6 flex items-center gap-2"
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
                
                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-2">
                        <div className="container-custom flex flex-col space-y-3 pb-3">
                            {/* Manager Mobile Navigation Links */}
                            {isAuthenticated && userType === 'manager' && (
                                <>
                                    <Link 
                                        to={'/manager/dashboard'} 
                                        className={`${isActive('/manager/dashboard')} py-2 px-3 rounded-md font-pmedium`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link 
                                        to={'/manager/add-employee'} 
                                        className={`${isActive('/manager/add-employee')} py-2 px-3 rounded-md font-pmedium`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Add Employee
                                    </Link>
                                    <Link 
                                        to={'/manager/employees'} 
                                        className={`${isActive('/manager/employees')} py-2 px-3 rounded-md font-pmedium`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        All Employees
                                    </Link>
                                </>
                            )}
                            
                            {/* Employee Mobile Navigation Links */}
                            {isAuthenticated && userType === 'employee' && (
                                <>
                                    <Link 
                                        to={'/employee/dashboard'} 
                                        className={`${isActive('/employee/dashboard')} py-2 px-3 rounded-md font-pmedium`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link 
                                        to={'/employee/change-password'} 
                                        className={`${isActive('/employee/change-password')} py-2 px-3 rounded-md font-pmedium`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Change Password
                                    </Link>
                                </>
                            )}
                            
                            {!isAuthenticated ? (
                                <div className="flex flex-col space-y-2 pt-2">
                                    <Link 
                                        to={'/login'} 
                                        className="btn btn-primary w-full text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to={'/register'} 
                                        className="btn border border-primary text-primary hover:bg-primary hover:text-white w-full text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => {
                                        logoutHandler()
                                        setIsMenuOpen(false)
                                    }} 
                                    className="btn btn-danger w-full text-center mt-2"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    )
}

export default Navbar