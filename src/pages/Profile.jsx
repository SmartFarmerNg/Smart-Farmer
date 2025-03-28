import { onAuthStateChanged } from 'firebase/auth';
import { ArrowDownLeft, ArrowLeft, ArrowRightLeft, ArrowUpRight, Bell, ChartNoAxesColumn, Home, LogOut, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

import * as motion from "motion/react-client"
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { doc, getDoc } from 'firebase/firestore';


const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState([]); // State to store the logged-in user's data
    const [loading, setLoading] = useState(true); // State to track loading status
    const [isLogginOut, setIsLogginout] = useState(false); // State to track loading status

    const fetchUserData = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    useEffect(() => {
        // Set up the Firebase auth state observer
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // If a user is logged in, store their data in state
                const userData = await fetchUserData(currentUser.uid);
                setUser(userData);
            } else {
                // If no user is logged in, redirect to the login page
                navigate('/sign-in');
            }
            console.log(currentUser);

            setLoading(false); // Set loading to false once the user data is fetched
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, [navigate]);
    if (loading) {
        return <>
            <Barloader /> {/* // Show a loading indicator while checking auth state */}
            <Footer page='dashboard' />
        </>
    }

    const handleLogout = () => {
        setIsLogginout(true)
        setTimeout(() => {
            auth.signOut();
        }, 1000);
    };
    return (
        <div className='bg-[#FFFBFA] w-full font-sans'>
            {isLogginOut && <Barloader />}
            <div className='h-screen flex flex-col w-full md:w-[70%] lg:w-[50%] py-5 m-auto'>
                <header className='w-full mb-5 flex items-center gap-3 px-5'>
                    <button onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className='text-black w-6 h-6' />
                    </button>
                    <LogOut onClick={() => handleLogout()} className='text-black w-6 h-6 ml-auto' />
                    <Bell className='text-black w-6 h-6' />
                </header>
                <div className='flex flex-col gap-1 mr-auto px-5'>
                    <h1 className='text-sm font-bold'>Hi, {user.username}</h1>
                    <span className='text-sm'>Welcome</span>
                </div>
                <section className='px-5'>
                    <motion.div
                        initial={{ opacity: 0, transform: 'translateX(100px)' }}
                        animate={{ opacity: 1, transform: 'translateX(0)' }}
                        transition={{
                            duration: 0.8,
                            delay: 0.1,
                            ease: [0, 0.71, 0.2, 1.01],
                        }}
                        className='bg-[#DBF1EC] w-full rounded-xl flex justify-between p-3 px-5 shadow-2xl my-6'>
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
                                onClick={() => navigate('/deposit')}
                            >
                                Fund account
                            </motion.button>
                        </div>
                        <Home />
                    </motion.div>
                </section>
                <section className='px-5'>
                    <motion.h1
                        initial={{ opacity: 0, transform: 'translateX(100px)' }}
                        animate={{ opacity: 1, transform: 'translateX(0)' }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: [0, 0.71, 0.2, 1.01],
                        }}
                        className='text-base font-bold'>Recent transactions</motion.h1>
                    <div className='flex flex-col gap-2 mt-4'>
                        <motion.div
                            initial={{ opacity: 0, transform: 'translateX(100px)' }}
                            animate={{ opacity: 1, transform: 'translateX(0)' }}
                            transition={{
                                duration: 0.8,
                                delay: 0.25,
                                ease: [0, 0.71, 0.2, 1.01],
                            }} className='flex items-center gap-4 bg-white shadow-xl py-2 px-3 rounded-xl'>
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
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, transform: 'translateX(100px)' }}
                            animate={{ opacity: 1, transform: 'translateX(0)' }}
                            transition={{
                                duration: 0.8,
                                delay: 0.3,
                                ease: [0, 0.71, 0.2, 1.01],
                            }} className='flex items-center gap-4 bg-white shadow-xl py-2 px-3 rounded-xl'>
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
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, transform: 'translateX(100px)' }}
                            animate={{ opacity: 1, transform: 'translateX(0)' }}
                            transition={{
                                duration: 0.8,
                                delay: 0.35,
                                ease: [0, 0.71, 0.2, 1.01],
                            }} className='flex items-center gap-4 bg-white shadow-xl py-2 px-3 rounded-xl'>
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
                        </motion.div>
                    </div>
                </section>
            </div>
            <Footer page='profile' />
        </div>
    )
}

export default Profile