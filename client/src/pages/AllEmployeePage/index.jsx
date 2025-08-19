import React, { useEffect, useState } from 'react'
import { axiosClient } from '../../utils/axiosClient'
import { toast } from 'react-toastify'
import EmpCard from './EmpCard'

const AllEmployeePage = () => {

    const [emps, setEmps] = useState([])
    const fetchAllEmployees = async () => {
        try {
            const response = await axiosClient.get("/all-emp", {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
            const data = await response.data
            setEmps(data)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
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

    return (
        <>
            <div className="container mx-auto py-10">
                <h2 className="text-2xl font-bold mb-4">All Employees</h2>
                <table className='border w-full table-auto bg-blue-100'>
                    <thead>
                        <tr>
                            <th className='py-5 border-r border-b'>ID</th>
                            <th className='py-5 border-r border-b'>Name</th>
                            <th className='py-5 border-r border-b'>Email</th>
                            <th className='py-5 border-r border-b'>Image</th>
                            <th className='py-5 border-r border-b'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            emps && emps.length > 0 ?
                                emps.map((cur, i) => {
                                    return <EmpCard key={i} data={cur} onDelete={deleteEmp} />
                                })
                                : <tr><td colSpan="5" className="text-center py-4">No employees found</td></tr>
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default AllEmployeePage