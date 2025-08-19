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


const LoginPage = () => {

    const [isShow, setIsShow] = useState(false)
    const [captcha, setCaptcha] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const { fetchUserProfile } = useMainContext()
    const initialValues = {
        email: '',
        password: '',
        captcha: '',

    }

    const validationSchema = yup.object({
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
            const response = await axiosClient.post('/login', values)
            const data = await response.data

            localStorage.setItem("token", data.token)
            toast.success(data.message)
            await fetchUserProfile()
            navigate("/")
            helpers.resetForm()



            toast.success('Login Successful')
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
                        <CustomLoaderButton isLoading={loading} text="Login" />
                    </div>
                    <div className="mb-3">
                        <p className="text-end">
                            Don't have an account? <Link to={'/register'}
                                className="font-psmbold text-indigo-500">Register</Link>
                        </p>
                    </div>


                </Form>
            </Formik>
        </div>
    )
}

export default LoginPage