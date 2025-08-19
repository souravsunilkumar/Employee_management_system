import React from 'react'

const Footer = () => {
    return (
        <div className="py-10 bg-gray-200 text-center">
            <p className="text-center">
                Sourav@ <span className='font-psmbold'>{new Date().getFullYear()}</span>
            </p>
        </div>
    )
}

export default Footer