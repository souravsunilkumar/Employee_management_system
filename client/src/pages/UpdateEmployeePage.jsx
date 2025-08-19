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
        address: ''
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
                    address: employeeData.address || ''
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
        email: yup.string().required("Email is required").email("Enter valid Email")
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
        <>
            {fetchLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmitHandler}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                >
                    <Form className='w-[90%] mx-auto py-10 bg-zinc-100'>
                        <h2 className="text-2xl font-bold text-center mb-6">Update Employee</h2>

                        <div className="mb-3">
                            <label htmlFor="">Employee Name <span className="text-red-500"></span> </label>
                            <Field type="text" name='name' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium' placeholder='Enter Employee Name' />
                            <ErrorMessage name='name' component={'p'} className='text-red-500
                        text-xs' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="">Employee Role <span className="text-red-500"></span> </label>
                            <Field as='select' name='role' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium'>
                                <option value={''}>-----Select Role-----</option>
                                {
                                    EmployeeRoles.map((cur, i) => {
                                        return <option value={cur} key={i}>{cur}</option>
                                    })
                                }
                            </Field>
                            <ErrorMessage name='role' component={'p'} className='text-red-500
                        text-xs' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="">Employee Salary <span className="text-red-500"></span> </label>
                            <Field type="number" name='salary' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium' placeholder='Enter Employee Salary' />
                            <ErrorMessage name='salary' component={'p'} className='text-red-500
                        text-xs' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="">Employee Image <span className="text-red-500"></span> </label>
                            <Field type="url" name='image' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium' placeholder='Employee Image URL' />
                            <ErrorMessage name='image' component={'p'} className='text-red-500
                        text-xs' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="">Employee Mobile No. <span className="text-red-500"></span> </label>
                            <Field type="text" name='mobile' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium' placeholder='Enter Employee Mobile No.' />
                            <ErrorMessage name='mobile' component={'p'} className='text-red-500
                        text-xs' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="">Employee Email ID <span className="text-red-500"></span> </label>
                            <Field type="email" name='email' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium' placeholder='Enter Employee Email ID' />
                            <ErrorMessage name='email' component={'p'} className='text-red-500
                        text-xs' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="">Employee Address <span className="text-red-500"></span> </label>
                            <Field as='textarea' rows={2} name='address' className='w-full py-2 border border-gray-300 rounded
                        outline-none px-3 placeholder:font-pmedium' placeholder='Enter Employee Address' />
                            <ErrorMessage name='address' component={'p'} className='text-red-500
                        text-xs' />
                        </div>
                        <div className="mb-3">
                            <CustomLoaderButton isLoading={loading} text="Update Employee" />
                        </div>
                        <div className="mb-3 text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/all-employees')}
                                className="btn px-4 py-2 bg-gray-500 text-white">
                                Cancel
                            </button>
                        </div>
                    </Form>
                </Formik>
            )}
        </>
    )
}

export default UpdateEmployeePage