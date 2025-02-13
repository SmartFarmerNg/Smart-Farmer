import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

import * as motion from "motion/react-client"


const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // State to store the logged-in user's data
    const [loading, setLoading] = useState(true); // State to track loading status

    useEffect(() => {
        // Set up the Firebase auth state observer
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // If a user is logged in, store their data in state
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                });
            } else {
                // If no user is logged in, redirect to the login page
                navigate('/sign-in');
            }
            setLoading(false); // Set loading to false once the user data is fetched
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, [navigate]);


    return (
        <div className=' bg-[#FFFBFA] w-full font-sans'>
            <div className='h-screen flex flex-col w-full md:w-[70%] lg:w-[50%] p-5 m-auto gap-3'>
                <header className='w-full mb-5 flex items-center justify-between'>
                    <button onClick={() => navigate('/profile')} className='mr-auto cursor-pointer'>
                        <ArrowLeft className='text-black w-6 h-6' />
                    </button>
                </header>
                <div className='flex flex-col items-center gap-1 mr-auto px-5'>
                    <h1 className='text-2xl font-bold text-[#0FA280]'>Deposit</h1>
                </div>
                <motion.button
                    initial={{ opacity: 0, transform: 'translateX(100px)' }}
                    animate={{ opacity: 1, transform: 'translateX(0)' }}
                    transition={{
                        duration: 0.8,
                        delay: 0.1,
                        ease: [0, 0.71, 0.2, 1.01],
                    }}
                    className='flex justify-between items-center border-2 border-[#0FA280] rounded-lg p-3 cursor-pointer'>
                    <h1 className='font-bold'>Deposit via Paystack</h1>
                    <ArrowRight className='text-[#0FA280] w-6 h-6' />
                </motion.button>
                <motion.button
                    initial={{ opacity: 0, transform: 'translateX(100px)' }}
                    animate={{ opacity: 1, transform: 'translateX(0)' }}
                    transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: [0, 0.71, 0.2, 1.01],
                    }}
                    className='flex justify-between items-center border-2 border-[#0FA280] rounded-lg p-3 cursor-pointer'>
                    <h1 className='font-bold'>Deposit via Bank Transfer</h1>
                    <ArrowRight className='text-[#0FA280] w-6 h-6' />
                </motion.button>
            </div>
        </div>
    )
}

export default Deposit