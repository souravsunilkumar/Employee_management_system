import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedLayout from './layout/ProtectedLayout'
import EmployeeLayout from './layout/EmployeeLayout'
import DashboardPage from './pages/DashboardPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import AddEmployeePage from './pages/AddEmployeePage'
import AllEmployeesPage from './pages/AllEmployeePage'
import UpdateEmployeePage from './pages/UpdateEmployeePage'
import EmployeeDashboardPage from './pages/EmployeeDashboardPage'
import EmployeeChangePasswordPage from './pages/EmployeeChangePasswordPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import 'react-toastify/dist/ReactToastify.css'
import { MainContextProvider } from './context/mainContext'

// Role-based redirect component
const RoleBasedRedirect = () => {
  const userType = localStorage.getItem('userType')
  
  if (userType === 'employee') {
    return <Navigate to="/employee/dashboard" replace />
  } else if (userType === 'manager') {
    return <Navigate to="/manager/dashboard" replace />
  } else {
    return <Navigate to="/login" replace />
  }
}

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/' element={<RoleBasedRedirect />} />
        
        {/* Manager/Admin Routes */}
        <Route path='/manager' element={<ProtectedLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path='dashboard' element={<ManagerDashboardPage />} />
          <Route path='add-employee' element={<AddEmployeePage />} />
          <Route path='employees' element={<AllEmployeesPage />} />
          <Route path='update-employee/:id' element={<UpdateEmployeePage />} />
        </Route>
        
        {/* Employee Routes */}
        <Route path='/employee' element={<EmployeeLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path='dashboard' element={<EmployeeDashboardPage />} />
          <Route path='change-password' element={<EmployeeChangePasswordPage />} />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App