import React, { useEffect, useState } from 'react'
import { ErrorMessage, Field, Formik, Form } from 'formik'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { HiRefresh } from "react-icons/hi";
import CustomLoaderButton from '../components/CustomLoaderButton'
import { Link, useNavigate } from 'react-router-dom'
import { axiosClient } from '../utils/axiosClient'
import { useMainContext } from '../context/mainContext'



const RegisterPage = () => {

    const [isShow, setIsShow] = useState(false)
    const [captcha, setCaptcha] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { fetchUserProfile } = useMainContext()

    const initialValues = {
        name: '',
        email: '',
        password: '',
        captcha: '',

    }

    const validationSchema = yup.object({
        name: yup.string().required('Name is required'),
        email: yup.string().email('Email must be valid').required('Email is required'),
        password: yup.string().required('Password is required'),
        captcha: yup.string().required('Captcha is required'),
    })

    const onSubmitHandler = async (values, helpers) => {
        try {
            setLoading(true)
            //validate captcha
            if (values.captcha != eval(captcha)) {
                toast.error('Invalid captcha')
                return
            }

            delete values.captcha

            const response = await axiosClient.post('/register', values)

            const data = await response.data

            toast.success(data.message)
            await fetchUserProfile()
            localStorage.setItem("token", data.token)
            helpers.resetForm()
            navigate("/")
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    let CaptchaOperators = ["+", "-",];

    const generateCaptcha = () => {

        let str = `${Math.floor(Math.random() * 100)}${CaptchaOperators[Math.floor(Math.random() * CaptchaOperators.length)]}${Math.floor(Math.random() * 100)}`
        setCaptcha(str)
    };

    useEffect(() => {
        generateCaptcha()
    }, [])


    return (
        <div className="min-h-[70vh] flex items-center justify-center flex-col">
            <Formik
                validationSchema={validationSchema}
                initialValues={initialValues}
                onSubmit={onSubmitHandler}
            >
                <Form className="w-[98%] md:w-1/2  lg:w-1/3 border-3 py-10 px-4 rounded border-gray-400">
                    <div className="mb-3">
                        <label htmlFor="name">Name</label>
                        <Field name="name" type="text" className="w-full py-2 border placeholder:font-pmedium 
                        border-gray-500 rounded px-3 outline-none"
                            placeholder="Enter your name" />
                        <ErrorMessage name="name" className="text-red-500 text-xs" component={'p'} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email">Email</label>
                        <Field name="email" type="email" className="w-full py-2 border placeholder:font-pmedium 
                        border-gray-500 rounded px-3 outline-none"
                            placeholder="Enter your Email" />
                        <ErrorMessage name="email" className="text-red-500 text-xs" component={'p'} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">Password</label>
                        <div className="flex w-full border border-gray-500 rounded item-center justify-between px-4">
                            <Field name="password" type={isShow ? "text" : "password"} className="py-2 w-full placeholder:font-pmedium 
                            outline-none"
                                placeholder="Enter your Password" />
                            <button type='button' onClick={() => setIsShow(!isShow)} className="text-gray-400 text-2xl">
                                {
                                    isShow ? <FaEye /> : <FaEyeSlash />
                                }
                            </button>
                        </div>
                        <ErrorMessage name="password" className="text-red-500 text-xs" component={'p'} />
                    </div>

                    <div className="flex mb-3 items-center justify-between">
                        <p className='text-center w-1/2'>{captcha}</p>
                        <button type='button' onClick={generateCaptcha} className='text-center w-1/2'>
                            <HiRefresh />
                        </button>
                        <div className="flex flex-col w-full">
                            <Field placeholder="Enter captcha" name="captcha" className="w-full py-2 border placeholder:font-pmedium 
                            border-gray-500 font-pbold rounded px-3 outline-none"/>
                            <ErrorMessage name="captcha" className="text-red-500 text-xs" component={'p'} />
                        </div>
                    </div>

                    <div className="mb-3">
                        <CustomLoaderButton isLoading={loading} text="Register" />
                    </div>
                    <div className="mb-3">
                        <p className="text-end">
                            Already have an account? <Link to={'/login'}
                                className="font-psmbold text-indigo-500">Login</Link>
                        </p>
                    </div>


                </Form>
            </Formik>
        </div>
    )
}

export default RegisterPage