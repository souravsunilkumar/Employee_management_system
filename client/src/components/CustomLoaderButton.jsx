import React from 'react'
import clsx from 'clsx'
import { CgSpinner } from 'react-icons/cg'
import { FaArrowRight } from 'react-icons/fa'

const CustomLoaderButton = ({
    type = 'submit',
    isLoading = false,
    text = '',
    className = '',

}) => {
    return (
        <button type={type} className={clsx(className, 'w-full bg-indigo-600 disabled:bg-indigo-800 hover:bg-indigo-700 flex items-center justify-center gap-x-1 py-2 rounded text-white')}>
            <span>{text}</span>
            {
                isLoading ? <CgSpinner className='text-xl animate-spin' /> : <FaArrowRight />
            }
        </button>
    )
}

export default CustomLoaderButton