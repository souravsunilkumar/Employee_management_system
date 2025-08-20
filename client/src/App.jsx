import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ManagerLayout from './layout/ManagerLayout'
import EmployeeLayout from './layout/EmployeeLayout'
import DashboardPage from './pages/DashboardPage'
import ManagerDashboardPage from './pages/ManagerDashboardPage'
import AddEmployeePage from './pages/AddEmployeePage'
import AllEmployeesPage from './pages/AllEmployeePage'
import UpdateEmployeePage from './pages/UpdateEmployeePage'
import EmployeeDashboardPage from './pages/EmployeeDashboardPage'
import EmployeeChangePasswordPage from './pages/EmployeeChangePasswordPage'
import AssignTaskPage from './pages/AssignTaskPage'
import ManagerTasksPage from './pages/ManagerTasksPage'
import ReviewTaskPage from './pages/ReviewTaskPage'
import MyTasksPage from './pages/MyTasksPage'
import TaskDetailsPage from './pages/TaskDetailsPage'
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
        <Route path='/manager' element={<ManagerLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path='dashboard' element={<ManagerDashboardPage />} />
          <Route path='assign-task' element={<AssignTaskPage />} />
          <Route path='tasks' element={<ManagerTasksPage />} />
          <Route path='task/:taskId' element={<TaskDetailsPage />} />
          <Route path='review-task/:taskId' element={<ReviewTaskPage />} />
          <Route path='add-employee' element={<AddEmployeePage />} />
          <Route path='employees' element={<AllEmployeesPage />} />
          <Route path='update-employee/:id' element={<UpdateEmployeePage />} />
        </Route>
        
        {/* Employee Routes */}
        <Route path='/employee' element={<EmployeeLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path='dashboard' element={<EmployeeDashboardPage />} />
          <Route path='tasks' element={<MyTasksPage />} />
          <Route path='task/:taskId' element={<TaskDetailsPage />} />
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