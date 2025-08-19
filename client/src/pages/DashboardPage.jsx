import React from 'react'
import { FaUsersLine } from 'react-icons/fa6'
import { useSelector } from 'react-redux'
import { AuthSlicePath } from '../redux/slice/auth.slice'

const DashboardPage = () => {

    const authUser = useSelector(AuthSlicePath)

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 py-10">
                <div className="w-full border px-3 py-3 border-gray-300 rounded
                flex justify-between items-start">
                    <FaUsersLine className='text-5xl' />

                    <div className="flex flex-col">
                        <p className="text-xl font-pmedium">Total Employees</p>
                        <p className="text-end font-pbold">{authUser && authUser.total_emp} </p>
                    </div>

                </div>
            </div>

        </>
    )
}

export default DashboardPage