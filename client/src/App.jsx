import React from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedLayout from './layout/ProtectedLayout'
import AddEmployeePage from './pages/AddEmployeePage'
import AllEmployeePage from './pages/AllEmployeePage'
import UpdateEmployeePage from './pages/UpdateEmployeePage'

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>

        <Route Component={ProtectedLayout}>
          <Route path="/" Component={DashboardPage} />
          <Route path="/add-employee" Component={AddEmployeePage} />
          <Route path="/all-employees" Component={AllEmployeePage} />
          <Route path="/update-employees/:id" Component={UpdateEmployeePage} />
        </Route>
        <Route path="/login" Component={LoginPage} />
        <Route path="/register" Component={RegisterPage} />
      </Routes>
      <Footer />
    </>
  )
}

export default App