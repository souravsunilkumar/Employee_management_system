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
        captcha: ''
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
        <div className="min-h-[80vh] flex items-center justify-center flex-col py-10">
            <div className="w-full max-w-md mx-auto overflow-hidden shadow-lg bg-white rounded-lg">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 text-white">
                    <h2 className="text-2xl font-bold text-center">Create Account</h2>
                    <p className="text-center text-white/80 mt-1">Join our employee management system</p>
                </div>
                
                <Formik
                    validationSchema={validationSchema}
                    initialValues={initialValues}
                    onSubmit={onSubmitHandler}
                >
                    <Form className="p-6">
                        {/* Name Field */}
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <Field 
                                name="name" 
                                type="text" 
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                placeholder="Enter your full name" 
                            />
                            <ErrorMessage name="name" className="text-red-500 text-xs mt-1" component={'p'} />
                        </div>
                        
                        {/* Email Field */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <Field 
                                name="email" 
                                type="email" 
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                                placeholder="Enter your email" 
                            />
                            <ErrorMessage name="email" className="text-red-500 text-xs mt-1" component={'p'} />
                        </div>
                        
                        {/* Password Field */}
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="flex w-full border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                <Field 
                                    name="password" 
                                    type={isShow ? "text" : "password"} 
                                    className="py-2 px-3 w-full outline-none" 
                                    placeholder="Create a secure password" 
                                />
                                <button 
                                    type='button' 
                                    onClick={() => setIsShow(!isShow)} 
                                    className="px-3 text-gray-500 hover:text-gray-700 transition-colors"
                                    aria-label={isShow ? "Hide password" : "Show password"}
                                >
                                    {isShow ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                            <ErrorMessage name="password" className="text-red-500 text-xs mt-1" component={'p'} />
                        </div>
                        
                        {/* Captcha Field */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Captcha Verification</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 bg-gray-100 p-3 rounded-lg font-bold text-lg text-center w-24">
                                    {captcha}
                                </div>
                                <button 
                                    type='button' 
                                    onClick={generateCaptcha} 
                                    className='p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                                    aria-label="Refresh captcha"
                                >
                                    <HiRefresh className="text-gray-600" />
                                </button>
                                <div className="flex-grow">
                                    <Field 
                                        placeholder="Enter result" 
                                        name="captcha" 
                                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <ErrorMessage name="captcha" className="text-red-500 text-xs mt-1" component={'p'} />
                                </div>
                            </div>
                        </div>
                        
                        {/* Register Button */}
                        <div className="mb-4">
                            <CustomLoaderButton isLoading={loading} text="Create Account" />
                        </div>
                        
                        {/* Login Link */}
                        <div className="text-center text-sm">
                            <p>
                                Already have an account? <Link to='/login' className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">Sign In</Link>
                            </p>
                        </div>
                    </Form>
                </Formik>
            </div>
        </div>
    )
}

export default RegisterPage