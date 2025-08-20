import React, { createContext, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { axiosClient } from '../utils/axiosClient'
import { useState } from 'react'
import { removeUser, setUser } from '../redux/slice/auth.slice'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ScreenLoaderComponet from '../components/ScreenLoaderComponet'


const mainContext = createContext()
export const useMainContext = () => useContext(mainContext)

export const MainContextProvider = ({ children }) => {

    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()
    const navigate = useNavigate()


    const logoutHandler = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("userType")
        
        // Dispatch a custom event to notify components about logout
        window.dispatchEvent(new Event('app-logout'))
        
        navigate("/login")
        dispatch(removeUser())
        toast.success("Logout Success")
    }



    const fetchUserProfile = async () => {
        try {

            setLoading(true)
            const token = localStorage.getItem("token") || ''
            if (!token) return

            const response = await axiosClient.get("/profile", {
                headers: {
                    "Authorization": 'Bearer ' + token
                }
            })
            const data = await response.data
            dispatch(setUser(data))

        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserProfile()
    }, [])

    if (loading) {
        return <ScreenLoaderComponet />
    }


    return (
        <mainContext.Provider value={{ fetchUserProfile, logoutHandler }}>{children}</mainContext.Provider>
    )
}
