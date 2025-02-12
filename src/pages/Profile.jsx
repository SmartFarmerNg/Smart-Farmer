import { onAuthStateChanged } from 'firebase/auth';
import { ArrowDownLeft, ArrowLeft, ArrowRightLeft, ArrowUpRight, Bell, ChartNoAxesColumn, Home, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

import * as motion from "motion/react-client"
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';


const Profile = () => {
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
                navigate('/login');
            }
            console.log(currentUser);

            setLoading(false); // Set loading to false once the user data is fetched
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <Barloader />; // Show a loading indicator while checking auth state
    }
    return (
        <div className=' bg-[#FFFBFA] w-full font-serif'>
            <div className='h-screen flex flex-col w-full md:w-[70%] lg:w-[50%] py-5 m-auto'>
                <header className='w-full mb-5 flex items-center justify-between px-5'>
                    <button onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className='text-black w-6 h-6' />
                    </button>
                    <Bell className='text-black w-6 h-6' />
                </header>
                <div className='flex flex-col items-center gap-1 mr-auto px-5'>
                    <h1 className='text-sm font-bold'>Hi, User</h1>
                    <span className='text-sm'>Welcome</span>
                </div>
                <section className='px-5'>
                    <div className='bg-[#DBF1EC] w-full rounded-xl flex justify-between p-3 px-5 shadow-2xl my-6'>
                        <div className='flex flex-col justify-between gap-3'>
                            <div className='flex flex-col gap-1'>
                                <h1 className='font-extrabold text-xs'>Primary account</h1>
                                <span className='text-xs'>$20,000</span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <h1 className='font-extrabold text-xs'>Available balance</h1>
                                <span className='text-xs'>$20,000</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.85 }}
                                type="button"
                                className='bg-[#442C2E] px-1 py-2 w-full font-semibold text-sm rounded-lg text-white'
                                onClick={() => navigate('/dashboard')}
                            >
                                Fund account
                            </motion.button>
                        </div>
                        <Home />
                    </div>
                </section>
                <section className='px-5'>
                    <h1 className='text-sm font-bold'>Recent transactions</h1>
                    <div className='flex flex-col gap-2 mt-4'>
                        <div className='flex items-center gap-4 bg-white shadow-xl py-2 px-3 rounded-xl'>
                            <div className='flex items-center w-10 h-10 bg-[#46BF5A] rounded-full justify-center text-white'>
                                <ArrowDownLeft />
                            </div>
                            <div className='text-sm'>
                                <h1 className='font-bold'>Deposit</h1>
                                <span className='text-[#6b6b6bb6] text-xs'>March 7, 2024</span>
                            </div>
                            <div className='self-start ml-auto text-sm'>
                                <h1>$50,500</h1>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 bg-white shadow-xl py-2 px-3 rounded-xl'>
                            <div className='flex items-center w-10 h-10 bg-[#46BF5A] rounded-full justify-center text-white'>
                                <ArrowDownLeft />
                            </div>
                            <div className='text-sm'>
                                <h1 className='font-bold'>Deposit</h1>
                                <span className='text-[#6b6b6bb6] text-xs'>March 7, 2024</span>
                            </div>
                            <div className='self-start ml-auto text-sm'>
                                <h1>$50,500</h1>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 bg-white shadow-xl py-2 px-3 rounded-xl'>
                            <div className='flex items-center w-10 h-10 bg-[#D90101] rounded-full justify-center text-white'>
                                <ArrowUpRight />
                            </div>
                            <div className='text-sm'>
                                <h1 className='font-bold'>Withdraw</h1>
                                <span className='text-[#6b6b6bb6] text-xs'>March 7, 2024</span>
                            </div>
                            <div className='self-start ml-auto text-sm'>
                                <h1>$50,500</h1>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer page='profile' />
        </div>
    )
}

export default Profile