import { ArrowRightLeft, ChartNoAxesColumn, Home, User } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const Footer = ({ page }) => {
    const navigate = useNavigate();
    return (
        <footer className='flex items-center justify-between bg-[#0FA280] fixed bottom-0 w-full py-3'>
            <button
                onClick={() => navigate('/dashboard')}
                className={`${page === 'dashboard' ? 'scale-110' : ''} flex flex-col items-center text-white text-xs ml-[10%] cursor-pointer`}
                >
                <Home className={`${page === 'dashboard' ? 'text-[#fff] scale-110' : 'text-[#B4C5B4]'} w-5 h-5`} />
                Home
            </button>
            <div className='flex flex-col items-center text-white text-xs'>
                <ChartNoAxesColumn className='text-[#B4C5B4] w-5 h-5' />
                Invest
            </div>
            <div className='flex flex-col items-center text-white text-xs'>
                <ArrowRightLeft className='text-[#B4C5B4] w-5 h-5' />
                Transact
            </div>
            <button
                onClick={() => navigate('/profile')}
                className={`${page === 'profile' ? 'scale-110' : ''} flex flex-col items-center text-white text-xs mr-[10%] cursor-pointer`}
            >
                <User className={`${page === 'profile' ? 'text-[#fff]' : 'text-[#B4C5B4]'} w-5 h-5`} />
                Profile
            </button>
        </footer>
    )
}

export default Footer