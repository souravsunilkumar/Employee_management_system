import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MdDashboard } from 'react-icons/md'
import { FaUser, FaUsers, FaUserPlus } from 'react-icons/fa'
import clsx from 'clsx'
import { axiosClient } from '../utils/axiosClient'
import { toast } from 'react-toastify'
import { useMainContext } from '../context/mainContext'

const SidebarItemList = [
    {
        name: 'Dashboard',
        link: '/manager/dashboard',
        Icon: MdDashboard
    },
    {
        name: 'Add Employee',
        link: '/manager/add-employee',
        Icon: FaUserPlus
    },
    {
        name: 'All Employees',
        link: '/manager/employees',
        Icon: FaUsers
    },
]

const ProtectedLayout = () => {
    const [loading, setLoading] = useState(true)
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { user, setUser } = useMainContext()
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true)
                const token = localStorage.getItem('token')
                const userType = localStorage.getItem('userType')
                
                if (!token || userType !== 'manager') {
                    navigate('/login')
                    return
                }
                
                // Verify token and get user profile
                const response = await axiosClient.get('/profile')
                console.log('Profile data:', response.data)
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

    if (loading) {
        return <div>Loading...</div>
    }




    return (
        <>
            <div className="flex w-[90%] mx-auto items-start flex-col lg:flex-row py-10 gap-x-1 gap-y-6">

                <div className="w-1/4 hidden lg:flex flex-col min-h-[70vh] bg-gray-200 py-4">
                    {
                        SidebarItemList.map((cur, i) => {
                            return <SidebarMenuItem item={cur} key={i} />
                        })
                    }

                </div>
                <ul className="flex lg:hidden item-center">
                    {
                        SidebarItemList.map((cur, i) => {
                            return <li key={i} className={clsx('bg-gray-200 text-sm font-pmedium px-5 py-2',
                                'hover:bg-gray-300', cur.link === pathname && 'bg-gray-300'
                            )}>
                                <Link to={cur.link}
                                    className="flex items-center gap-x-1"
                                ><cur.Icon className="text-lg" /> <span>{cur.name?.split(" ")[0]}</span> </Link>
                            </li>
                        })
                    }
                </ul>


                <section className="w-full">
                    <Outlet />
                </section>

            </div>
        </>
    )
}

export default ProtectedLayout

const SidebarMenuItem = ({ item }) => {
    const { pathname } = useLocation()
    return <Link to={item.link} className={clsx('w-full py-3 px-3 flex justify-start gap-x-3 items-center', 'hover:bg-gray-300 rounded', item.link === pathname && 'bg-gray-300')}>
        <item.Icon className="text-2xl" /> <span>{item.name}</span>
    </Link>
}