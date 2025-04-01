import { onAuthStateChanged } from 'firebase/auth';
import { ArrowDownLeft, ArrowLeft, ArrowRightLeft, ArrowUpRight, BadgeDollarSign, Bell, DollarSign, Home, LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { doc, getDoc } from 'firebase/firestore';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const fetchUserData = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setCurrentUser(currentUser);
                const userData = await fetchUserData(currentUser.uid);
                setUser(userData);
            } else {
                navigate('/sign-in');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) return <><Barloader /><Footer page='profile' /></>;

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => auth.signOut(), 1000);
    };

    return (<div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans'>
        <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto pb-14'>
            {isLoggingOut && <Barloader />}
            <div className='w-full max-w-2xl mx-auto py-5 flex flex-col flex-grow'>
                <header className='w-full flex items-center gap-3 mb-6'>
                    <button onClick={() => navigate('/dashboard')}><ArrowLeft className='text-white w-6 h-6 cursor-pointer' /></button>
                    <LogOut onClick={handleLogout} className='text-white w-6 h-6 ml-auto cursor-pointer' />
                    <Bell className='text-white w-6 h-6 cursor-pointer' />
                </header>
                <div>
                    <h1 className='text-sm font-semibold bg-white shadow-md px-6 py-3 rounded-2xl'>Hi, {currentUser?.displayName}</h1>
                </div>
                <section className='mt-6'>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className='bg-gray-100 shadow-md rounded-2xl p-5 border border-gray-300 flex justify-between items-center overflow-hidden'>
                        <div>
                            <h1 className='font-semibold text-gray-700 text-sm'>Primary account</h1>
                            <p className='text-base font-bold'>$1,500</p>
                            <h1 className='font-semibold text-gray-700 text-sm mt-2'>Available balance</h1>
                            <p className='text-base font-bold'>$1,500</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                className='mt-4 bg-[#0FA280] text-white py-2 px-4 rounded-lg shadow-md w-full cursor-pointer'
                                onClick={() => navigate('/deposit')}
                            >
                                Fund account
                            </motion.button>
                        </div>
                        <BadgeDollarSign className='text-[#0FA280] w-16 h-16 opacity-20 rotate-12 scale-400' />
                    </motion.div>
                </section>
                <section className='mt-6'>
                    <h1 className='text-lg font-semibold text-white'>Investment</h1>
                    <div className='flex flex-col gap-3 mt-4'>
                        {/* {['Deposit', 'Deposit', 'Withdraw'].map((type, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                className='bg-gray-100 shadow-md rounded-xl p-4 border border-gray-300 flex items-center gap-4 overflow-hidden'>
                                <div className={`w-10 h-10 scale-250 opacity-30 flex items-center justify-center rounded-full text-white ${type === 'Withdraw' ? 'bg-red-500' : 'bg-green-500'}`}>
                                {type === 'Withdraw' ? <ArrowUpRight /> : <ArrowDownLeft />}
                                </div>
                                <div>
                                    <h1 className='font-semibold text-gray-700'>{type}</h1>
                                    <span className='text-xs text-gray-500'>March 7, 2024</span>
                                    </div>
                                    <div className='ml-auto font-bold text-white'>$50,500</div>
                                    </motion.div>
                                    ))} */}
                    </div>
                </section>
            </div>
            <Footer page='profile' />
        </div>
    </div>
    );
};

export default Profile;
