import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEdit, FaTrash } from 'react-icons/fa'

const EmpCard = ({ data, onDelete }) => {
    const navigate = useNavigate()
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${data.name}?`)) {
            onDelete(data._id);
        }
    }
    
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <span className="font-psmbold">{data.empId}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                    <img 
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm" 
                        src={data.image} 
                        alt={data.name} 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center justify-center space-x-2">
                    <button 
                        onClick={() => navigate(`/update-employees/${data._id}`)}
                        className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                        title="Edit employee"
                    >
                        <FaEdit />
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="p-2 bg-red-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete employee"
                    >
                        <FaTrash />
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default EmpCard