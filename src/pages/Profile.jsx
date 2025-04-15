import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ArrowLeft, BadgeDollarSign, Bell, LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { doc, getDoc } from 'firebase/firestore';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                console.log(currentUser); // Log currentUser instead of user
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setBalance(userSnap.data().availableBalance || 0);
                    } else {
                        setBalance(0);
                    }
                } catch (error) {
                    console.error('Error fetching balance:', error);
                    setBalance(0);
                }
            } else {
                navigate('/sign-in');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);


    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            signOut(auth);
            navigate('/sign-in');
        }, 1000);
    };


    // if (loading) return <><Barloader /><Footer page='profile' /></>;

    return (
        <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans'>
            <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto pb-14 z-50'>
                {isLoggingOut || loading && <Barloader />}
                <div className='w-full max-w-2xl mx-auto py-5 flex flex-col flex-grow'>
                    <header className='w-full flex items-center gap-3 mb-6'>
                        <button onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className='text-white w-6 h-6 cursor-pointer' />
                        </button>
                        <LogOut onClick={handleLogout} className='text-white w-6 h-6 ml-auto cursor-pointer' />
                        <Bell className='text-white w-6 h-6 cursor-pointer' />
                    </header>
                    <div className='flex justify-between w-full items-center text-sm font-semibold bg-white shadow-md px-6 py-2 rounded-2xl'>
                        <h1 className=''>
                            Hi, {user?.displayName || 'User'}
                        </h1>
                        {user?.photoURL && (
                            <img className='w-10 h-10 rounded-full' src={user.photoURL} alt="User Profile" />
                        )}
                    </div>
                    <section className='mt-6'>
                        <div
                            className='bg-gray-100 shadow-md rounded-2xl p-5 border border-gray-300 flex justify-between items-center overflow-hidden'
                        >
                            <div>
                                <h1 className='font-semibold text-gray-700 text-sm mt-2'>Available balance</h1>
                                <p className='text-base font-bold'>NGN {balance?.toLocaleString() || '0'}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    className='mt-4 bg-[#0FA280] text-white py-2 px-4 rounded-lg shadow-md w-full cursor-pointer'
                                    onClick={() => navigate('/transact/deposit')}
                                >
                                    Fund account
                                </motion.button>
                            </div>
                            <BadgeDollarSign className='text-[#0FA280] w-16 h-16 opacity-20 rotate-12 scale-400' />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
