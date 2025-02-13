import { ArrowRightLeft, ChartNoAxesColumn, Home, User, UserCircle2 } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom';

const Footer = ({ page }) => {
    const navigate = useNavigate();
    return (
        <footer className='flex items-center justify-between bg-[#0FA280] fixed bottom-0 w-full py-3'>
            <button
                onClick={() => navigate('/dashboard')}
                className={`${page === 'dashboard' ? 'scale-110 gap-1 text-white' : ''} flex flex-col items-center text-[#B4C5B4] text-xs ml-[2%] cursor-pointer w-full`}
            >
                <Home className={`${page === 'dashboard' ? 'text-white scale-110' : 'text-[#B4C5B4]'} w-5 h-5`} />
                Home
            </button>
            <button
                onClick={() => navigate('/invest')}
                className={`${page === 'invest' ? 'scale-110 gap-1 text-white' : ''} flex flex-col items-center text-[#B4C5B4] text-xs cursor-pointer w-full`}
            >
                <ChartNoAxesColumn className={`${page === 'invest' ? 'text-white scale-110' : 'text-[#B4C5B4]'} w-5 h-5`} />
                Invest
            </button>
            <button
                onClick={() => navigate('/transact')}
                className={`${page === 'transact' ? 'scale-110 gap-1 text-white' : ''} flex flex-col items-center text-[#B4C5B4] text-xs cursor-pointer w-full`}
            >
                <ArrowRightLeft className={`${page === 'transact' ? 'text-white scale-110' : 'text-[#B4C5B4]'} w-5 h-5`} />
                Transact
            </button>
            <button
                onClick={() => navigate('/profile')}
                className={`${page === 'profile' ? 'scale-110 gap-1 text-white' : ''} flex flex-col items-center text-[#B4C5B4] text-xs mr-[2%] cursor-pointer w-full`}
            >
                <UserCircle2 className={`${page === 'profile' ? 'text-white' : 'text-[#B4C5B4]'} w-5 h-5`} />
                Profile
            </button>
        </footer>
    )
}

export default Footer