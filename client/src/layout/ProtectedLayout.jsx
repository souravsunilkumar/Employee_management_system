import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthSlicePath } from '../redux/slice/auth.slice'
import { MdDashboard } from 'react-icons/md'
import { FaUser } from 'react-icons/fa'
import { FaUsersLine } from 'react-icons/fa6'
import clsx from 'clsx'

const SidebarItemList = [
    {
        name: 'Dashboard',
        link: '/',
        Icon: MdDashboard
    },
    {
        name: 'Add Employee',
        link: '/add-employee',
        Icon: FaUser
    },
    {
        name: 'All Employees',
        link: '/all-employees',
        Icon: FaUsersLine
    },
]

const ProtectedLayout = () => {

    const user = useSelector(AuthSlicePath)
    const [loading, setLoading] = useState(true)
    const { pathname } = useLocation()
    const navigate = useNavigate()
    useEffect(() => {

        if (!user) {
            navigate("/login")

        } else {
            setLoading(false)
        }

    }, [user])

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