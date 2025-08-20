import { Formik, Form, ErrorMessage, Field } from 'formik'
import React, { useState, useEffect } from 'react'
import { EmployeeRoles } from '../utils/constant'
import CustomLoaderButton from '../components/CustomLoaderButton'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { axiosClient } from '../utils/axiosClient'
import { useMainContext } from '../context/mainContext'
import { faker } from '@faker-js/faker'
import { useNavigate, useParams } from 'react-router-dom'

const UpdateEmployeePage = () => {

    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const { fetchUserProfile } = useMainContext()
    const { id } = useParams()
    const navigate = useNavigate()

    const [initialValues, setInitialValues] = useState({
        name: '',
        role: '',
        salary: 0,
        image: '',
        mobile: '',
        email: '',
        address: '',
        hasLoginAccess: false,
        password: '',
        userType: 'employee'
    })

    // Fetch employee data when component mounts
    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                setFetchLoading(true)
                const response = await axiosClient.get(`/emp/${id}`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem("token")
                    }
                })
                const employeeData = response.data

                // Update the form with employee data
                setInitialValues({
                    name: employeeData.name || '',
                    role: employeeData.role || '',
                    salary: employeeData.salary || 0,
                    image: employeeData.image || '',
                    mobile: employeeData.mobile || '',
                    email: employeeData.email || '',
                    address: employeeData.address || '',
                    hasLoginAccess: employeeData.hasLoginAccess || false,
                    password: '', // Don't populate password for security reasons
                    userType: employeeData.userType || 'employee'
                })
            } catch (error) {
                toast.error(error?.response?.data?.error || "Failed to fetch employee data")
                navigate('/all-employees')
            } finally {
                setFetchLoading(false)
            }
        }

        fetchEmployeeData()
    }, [id, navigate])

    const validationSchema = yup.object({
        name: yup.string().required("Name is required"),
        salary: yup.number().min(0, "Salary cannot be negative or zero").required("Salary is required"),
        role: yup.string().required("Role is required"),
        mobile: yup.string().required("Mobile No. is required"),
        address: yup.string().required("Address is required"),
        image: yup.string().required("Image URL is required"),
        email: yup.string().required("Email is required").email("Enter valid Email"),
        hasLoginAccess: yup.boolean(),
        password: yup.string().when(['hasLoginAccess', 'password'], {
            is: (hasLoginAccess, password) => hasLoginAccess && !password,
            then: () => yup.string().test(
                'password-required-if-new',
                'Password is required when enabling login access for the first time',
                function(value) {
                    // If we're enabling login access for the first time, require a password
                    const { hasLoginAccess, password } = this.parent;
                    if (hasLoginAccess && !initialValues.hasLoginAccess) {
                        return Boolean(value);
                    }
                    return true;
                }
            ).min(6, 'Password must be at least 6 characters'),
            otherwise: () => yup.string().notRequired()
        }),
        userType: yup.string().oneOf(['employee', 'manager']).required('User type is required')
    })

    const TestData = () => {
        setInitialValues(
            {
                name: faker.person.fullName(),
                role: EmployeeRoles[Math.floor(Math.random() * EmployeeRoles.length)],
                salary: faker.number.int({ min: 1000, max: 100000 }),
                image: faker.image.avatar(),
                mobile: faker.number.int({ min: 1000000000, max: 9999999999 }),
                email: faker.internet.email(),
                address: faker.location.streetAddress(),
                hasLoginAccess: Math.random() > 0.5, // 50% chance of having login access
                password: faker.internet.password(8),
                userType: 'employee'
            }
        )
    }

    const onSubmitHandler = async (values, helpers) => {
        try {
            setLoading(true)
            const response = await axiosClient.put(`/emp/${id}`, values, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
            const data = response.data
            toast.success(data?.message || "Employee updated successfully")
            await fetchUserProfile()
            // Navigate back to the employees list after successful update
            navigate('/all-employees')
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {fetchLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600 font-medium">Loading employee data...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
                        <h2 className="text-2xl font-bold">Update Employee</h2>
                        <p className="text-white/80 mt-1">Edit employee information</p>
                    </div>
                    
                    <Formik
                        initialValues={initialValues}
                        onSubmit={onSubmitHandler}
                        validationSchema={validationSchema}
                        enableReinitialize={true}
                    >
                        <Form className="p-6 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Employee Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Employee Name <span className="text-red-500">*</span></label>
                                    <Field 
                                        type="text" 
                                        id="name"
                                        name="name" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        placeholder="Enter employee name" 
                                    />
                                    <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                
                                {/* Employee Role */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Employee Role <span className="text-red-500">*</span></label>
                                    <Field 
                                        as="select" 
                                        id="role"
                                        name="role" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                                    >
                                        <option value="">-- Select Role --</option>
                                        {EmployeeRoles.map((role, index) => (
                                            <option value={role} key={index}>{role}</option>
                                        ))}
                                    </Field>
                                    <ErrorMessage name="role" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                
                                {/* Employee Salary */}
                                <div>
                                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salary <span className="text-red-500">*</span></label>
                                    <Field 
                                        type="number" 
                                        id="salary"
                                        name="salary" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        placeholder="Enter salary amount" 
                                    />
                                    <ErrorMessage name="salary" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                
                                {/* Employee Image */}
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL <span className="text-red-500">*</span></label>
                                    <Field 
                                        type="url" 
                                        id="image"
                                        name="image" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        placeholder="Enter image URL" 
                                    />
                                    <ErrorMessage name="image" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                
                                {/* Employee Mobile */}
                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                    <Field 
                                        type="text" 
                                        id="mobile"
                                        name="mobile" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        placeholder="Enter mobile number" 
                                    />
                                    <ErrorMessage name="mobile" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                
                                {/* Employee Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                                    <Field 
                                        type="email" 
                                        id="email"
                                        name="email" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                        placeholder="Enter email address" 
                                    />
                                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                            </div>
                            
                            {/* Employee Address - Full Width */}
                            <div className="mt-6">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                                <Field 
                                    as="textarea" 
                                    id="address"
                                    name="address" 
                                    rows="3"
                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                    placeholder="Enter employee address" 
                                />
                                <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />
                            </div>
                            
                            {/* Login Access Section */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Login Access</h3>
                                
                                <div className="flex items-center mb-4">
                                    <Field 
                                        type="checkbox" 
                                        id="hasLoginAccess"
                                        name="hasLoginAccess" 
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                    />
                                    <label htmlFor="hasLoginAccess" className="ml-2 block text-sm text-gray-700">
                                        Enable login access for this employee
                                    </label>
                                </div>
                                
                                <Field name="hasLoginAccess">
                                    {({ field, form }) => {
                                        const showPasswordField = form.values.hasLoginAccess;
                                        const isNewLoginAccess = form.values.hasLoginAccess && !initialValues.hasLoginAccess;
                                        
                                        return showPasswordField ? (
                                            <div className="mb-4">
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                    {isNewLoginAccess ? (
                                                        <>
                                                            Password <span className="text-red-500">*</span>
                                                        </>
                                                    ) : (
                                                        <>New Password <span className="text-gray-500">(optional)</span></>
                                                    )}
                                                </label>
                                                <Field 
                                                    type="password" 
                                                    id="password"
                                                    name="password" 
                                                    className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                    placeholder={isNewLoginAccess ? "Enter password for employee login" : "Enter new password (leave blank to keep current)"} 
                                                />
                                                <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {isNewLoginAccess ? 
                                                        "Password must be at least 6 characters long" : 
                                                        "Leave blank to keep the current password unchanged"}
                                                </p>
                                            </div>
                                        ) : null;
                                    }}
                                </Field>
                                
                                <Field type="hidden" name="userType" value="employee" />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/all-employees')}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                
                                <div className="w-1/2">
                                    <CustomLoaderButton isLoading={loading} text="Update Employee" />
                                </div>
                            </div>
                        </Form>
                    </Formik>
                </div>
            )}
        </div>
    )
}

export default UpdateEmployeePage