import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'
import Footer from '../components/component/Footer'
import { useNavigate } from 'react-router-dom';

const Deposit = () => {
    const navigate = useNavigate();
    return (
        <div className=' bg-[#FFFBFA] w-full font-serif'>
            <div className='h-screen flex flex-col w-full md:w-[70%] lg:w-[50%] py-5 m-auto gap-3'>
                <header className='w-full mb-5 flex items-center justify-between px-5'>
                    <button onClick={() => navigate('/profile')} className='mr-auto'>
                        <ArrowLeft className='text-black w-6 h-6' />
                    </button>
                </header>
                <div className='flex flex-col items-center gap-1 mr-auto px-5'>
                    <h1 className='text-2xl font-bold text-[#0FA280]'>Deposit</h1>
                </div>
                <button className='flex justify-between items-center border-2 border-[#0FA280] rounded-lg p-5 cursor-pointer'>
                    <h1 className='font-bold text-xl'>Deposit via Paystack</h1>
                    <ArrowRight className='text-[#0FA280] w-6 h-6' />
                </button>
                <button className='flex justify-between items-center border-2 border-[#0FA280] rounded-lg p-5 cursor-pointer'>
                    <h1 className='font-bold text-xl'>Deposit via Bank Transfer</h1>
                    <ArrowRight className='text-[#0FA280] w-6 h-6' />
                </button>
            </div>
        </div>
    )
}

export default Deposit