import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from './Login'
import Barloader from '../components/component/Barloader'

const LandingPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            navigate('/sign-up')
        }, 1000);
    }


    return (
        <div className='bg-[#E7F6F2] h-screen flex flex-col items-center m-auto gap-6'>
            {isLoading && <Barloader />}
            <div className='container flex flex-col items-center gap-5 bg-white p-5 rounded-lg shadow-2xl shadow-[#00000098] mt-auto sm:w-[70%] lg:w-[50%] xl:w-[30%]'>
                <h1 className='text-4xl font-bold'>Logo</h1>
                <span className='text-md text-center'>Your partner in Smart farming. Get ready to transform your farming experience with Agrovest our app is designed to help you</span>
            </div>
            <button onClick={handleSubmit} className='bg-[#0FA280] hover:bg-[#0fa270] p-3 px-14 font-semibold text-xl rounded-lg mb-auto' >Get Started</button>
        </div>
    )
}

export default LandingPage