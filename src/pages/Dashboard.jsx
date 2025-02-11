import { ArrowRightLeft, Banknote, Briefcase, ChartNoAxesColumn, Home } from 'lucide-react'
import React from 'react'

const Dashboard = () => {
    return (
        <div className='h-screen w-full flex flex-col items-center bg-[#FFFBFA] py-4'>
            <h1 className='text-xl font-bold'>Invest</h1>
            <div className='flex items-center gap-5 w-full p-5'>
                <button className='bg-[#0FA280] flex gap-2 px-2 p-1 w-full rounded-md '>
                    <Banknote className='text-white w-6 h-6' />
                    <div className='flex flex-col items-start'>
                        <p className='text-sm font-semibold text-[#B4C5B4]'>Cash</p>
                        <p className='text-white font-semibold text-sm'>$150,250</p>
                    </div>
                </button>
                <button className='bg-[#0FA280] flex gap-2 px-2 p-1 w-full rounded-md'>
                    <Briefcase className='text-white w-5 h-6' />
                    <div className='flex flex-col items-start'>
                        <p className='textnpm run dev-sm font-semibold text-[#B4C5B4]'>Assets</p>
                        <p className='text-white font-semibold text-sm'>$530,000</p>
                    </div>
                </button>
            </div>
            <footer className='flex items-center justify-evenly bg-[#0FA280] fixed bottom-0 w-full p-2'>
                <div className='flex flex-col items-center text-white text-xs'>
                    <Home className='text-[#B4C5B4] w-5 h-5' />
                    Home
                </div>
                <div className='flex flex-col items-center text-white text-xs'>
                    <ChartNoAxesColumn className='text-[#B4C5B4] w-5 h-5' />
                    Invest
                </div>
                <div className='flex flex-col items-center text-white text-xs'>
                    <ArrowRightLeft className='text-[#B4C5B4] w-5 h-5' />
                    Transact
                </div>
            </footer>
        </div>
    )
}

export default Dashboard