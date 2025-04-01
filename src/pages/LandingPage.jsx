import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Barloader from '../components/component/Barloader';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';


const LandingPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            navigate('/sign-up');
        }, 1000);
    };

    return (
        <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans relative overflow-hidden min-h-screen'>
            {isLoading && <Barloader />}
            <FloatingBackground />

            <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center justify-center mx-auto py-6 pb-20 relative z-10'>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className='backdrop-blur-lg bg-white/10 shadow-xl rounded-2xl p-8 text-center max-w-2xl w-full'
                >
                    <img src='src/assets/Submark-removebg-preview.png' className='w-32 h-32 mx-auto' alt='Logo' />
                    <h1 className='text-3xl font-extrabold text-white drop-shadow-lg'>Smart Farmer</h1>
                    <p className='text-md mt-4 text-white/90 w-[70%] mx-auto'>
                        Your partner in Smart Farming. Transform your farming experience with intelligent insights and automation.
                    </p>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    className='mt-8 bg-white text-[#0FA280] px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-opacity-90 transition cursor-pointer'
                >
                    Get Started
                </motion.button>
            </div>
        </div>
    );
};

export default LandingPage;
