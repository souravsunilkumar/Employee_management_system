import { Formik, Form, ErrorMessage, Field } from 'formik'
import React, { useState } from 'react'
import { EmployeeRoles } from '../utils/constant'
import CustomLoaderButton from '../components/CustomLoaderButton'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { axiosClient } from '../utils/axiosClient'
import { useMainContext } from '../context/mainContext'
import { faker } from '@faker-js/faker'

const AddEmployeePage = () => {

    const [loading, setLoading] = useState(false)
    const { fetchUserProfile } = useMainContext()

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

    const validationSchema = yup.object({
        name: yup.string().required("Name is required"),
        salary: yup.number().min(0, "Salary cannot be negative or zero").required("Salary is required"),
        role: yup.string().required("Role is required"),
        mobile: yup.string().required("Mobile No. is required"),
        address: yup.string().required("Address is required"),
        image: yup.string().required("Image URL is required"),
        email: yup.string().required("Email is required").email("Enter valid Email"),
        hasLoginAccess: yup.boolean(),
        password: yup.string().when('hasLoginAccess', {
            is: true,
            then: () => yup.string().required('Password is required when login access is enabled').min(6, 'Password must be at least 6 characters'),
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
            const response = await axiosClient.post('/add-emp', values, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("token")
                }
            })
            const data = await response.data
            toast.success(data?.message)
            helpers.resetForm()
            await fetchUserProfile()

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
                    <h2 className="text-2xl font-bold">Add New Employee</h2>
                    <p className="text-white/80 mt-1">Enter employee details to add them to the system</p>
                </div>
                
                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmitHandler}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                >
                    <Form className="p-6 bg-white">
                        <div className="flex justify-end mb-6">
                            <button 
                                type="button" 
                                onClick={TestData} 
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                                </svg>
                                Generate Test Data
                            </button>
                        </div>
                        
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
                                    return showPasswordField ? (
                                        <div className="mb-4">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <Field 
                                                type="password" 
                                                id="password"
                                                name="password" 
                                                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                                placeholder="Enter password for employee login" 
                                            />
                                            <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                                            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
                                        </div>
                                    ) : null;
                                }}
                            </Field>
                            
                            <Field type="hidden" name="userType" value="employee" />
                        </div>
                        
                        {/* Submit Button */}
                        <div className="mt-8 flex justify-center">
                            <div className="w-full md:w-1/2">
                                <CustomLoaderButton isLoading={loading} text="Add Employee" />
                            </div>
                        </div>
                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default AddEmployeePage