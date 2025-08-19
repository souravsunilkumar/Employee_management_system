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
        address: ''
    })

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
        <>

            <Formik
                initialValues={initialValues}
                onSubmit={onSubmitHandler}
                validationSchema={validationSchema}
                enableReinitialize={true}
            >
                <Form className='w-[90%] mx-auto py-10 bg-zinc-100'>
                    <div className="mb-3 flex item-center justify-end">
                        <button type="submit" onClick={TestData} className="btn px-4 py-2 bg-indigo-500 text-white">Test</button>
                    </div>
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
                        <CustomLoaderButton isLoading={loading} text="Add Employee" />
                    </div>
                </Form>
            </Formik>
        </>
    )
}

export default AddEmployeePage