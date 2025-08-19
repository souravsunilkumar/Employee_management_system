import React from 'react'
import { Link } from 'react-router-dom'

const LogoComponents = () => {
    return (
        <>
            <Link to={'/'} className="flex items-center gap-x-1 text-2xl font-pbold">
                <span>Emp</span>
                <span className="w-3 h-3 animate-bounce bg-red-500 rounded-full"></span>
            </Link>
        </>
    )
}

export default LogoComponents