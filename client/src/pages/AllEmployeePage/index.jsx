import React, { useEffect, useState } from 'react'
import { axiosClient } from '../../utils/axiosClient'
import { toast } from 'react-toastify'
import EmpCard from './EmpCard'
import { FaSearch, FaPlus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { FiLoader } from 'react-icons/fi'

const AllEmployeePage = () => {
    const [emps, setEmps] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchAllEmployees = async () => {
        try {
            setLoading(true)
            const response = await axiosClient.get("/all-emp", {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
            const data = await response.data
            setEmps(data)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllEmployees()
    }, [])

    const deleteEmp = async (id) => {
        try {
            const response = await axiosClient.delete("/emp/" + id, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })

            const data = response.data

            await fetchAllEmployees()
            toast.dismiss()

            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    // Filter employees based on search term
    const filteredEmployees = emps.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="container-custom py-8">
            {/* Header section with title and add button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-pbold text-gray-800">Employee Directory</h1>
                    <p className="text-gray-500">Manage your employees</p>
                </div>

                <Link to="/manager/add-employee" className="btn btn-primary mt-3 md:mt-0 flex items-center gap-2">
                    <FaPlus size={14} />
                    <span>Add Employee</span>
                </Link>
            </div>

            {/* Search and filter section */}
            <div className="card p-4 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search employees by name, email or ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Employees table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <FiLoader className="animate-spin text-primary mr-2" size={24} />
                        <span>Loading employees...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-psmbold text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-psmbold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-psmbold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-psmbold text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-psmbold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp, i) => (
                                        <EmpCard key={i} data={emp} onDelete={deleteEmp} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'No employees match your search' : 'No employees found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllEmployeePage