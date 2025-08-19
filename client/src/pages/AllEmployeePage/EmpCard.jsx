import React from 'react'
import { useNavigate } from 'react-router-dom'

const EmpCard = ({ data, onDelete }) => {
    const navigate = useNavigate()
    return (
        <>
            <tr>
                <td className='py-3 px-2 border-b text-center font-bold border-r'>{data.empId}</td>
                <td className='py-3 px-2 border-b text-center border-r'>{data.name}</td>
                <td className='py-3 px-2 border-b text-center border-r'>{data.email}</td>
                <td className='py-3 px-2 border-b text-center border-r'>
                    <img className='w-16 h-16 rounded-full mx-auto' src={data.image} alt={data.name} />
                </td>
                <td className='text-center border-b'>
                    <button onClick={() => onDelete(data._id)} className='px-4 py-2 bg-red-500 text-white rounded mr-2'>Delete</button>
                    <button 
                        onClick={() => navigate(`/update-employees/${data._id}`)} 
                        className='px-4 py-2 bg-green-500 text-white rounded'>Edit</button>
                </td>
            </tr>
        </>
    )
}

export default EmpCard