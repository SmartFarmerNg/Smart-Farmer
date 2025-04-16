import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
    ArrowLeft,
    BadgeDollarSign,
    Bell,
    LogOut,
    Pencil,
    History,
    Settings,
    ChevronRight,
} from 'lucide-react';
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

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-white font-sans'>
            <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto pb-20'>
                {isLoggingOut || loading ? <Barloader /> : null}

                <div className='w-full py-5 flex flex-col flex-grow z-50'>
                    {/* Header */}
                    <header className='w-full flex items-center gap-3 mb-6'>
                        <button onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className='text-white w-6 h-6 cursor-pointer' />
                        </button>
                        <LogOut onClick={handleLogout} className='text-white w-6 h-6 ml-auto cursor-pointer' />
                        <Bell className='text-white w-6 h-6 cursor-pointer' />
                    </header>

                    {/* User Info */}
                    <div className='bg-white text-gray-800 shadow-lg px-6 py-4 rounded-2xl flex items-center justify-between'>
                        <div>
                            <h1 className='text-base font-semibold'>Hi, {user?.displayName || 'User'}</h1>
                            <p className='text-xs text-gray-500'>{user?.email}</p>
                            {user?.metadata?.creationTime && (
                                <p className='text-xs text-gray-400'>
                                    Joined: {formatDate(user.metadata.creationTime)}
                                </p>
                            )}
                        </div>
                        <img
                            className='w-12 h-12 rounded-full border border-gray-300 object-cover'
                            src={user?.photoURL || '/default-avatar.png'}
                            alt='User Avatar'
                        />
                    </div>

                    {/* Balance Section */}
                    <section className='mt-6'>
                        <div className='bg-gray-100 text-gray-900 shadow-md rounded-2xl p-5 border border-gray-300 flex justify-between items-center'>
                            <div>
                                <h1 className='font-semibold text-sm text-gray-700'>Available Balance</h1>
                                <p className='text-lg font-bold mt-1'>₦ {balance?.toLocaleString() || '0'}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    className='mt-4 bg-[#0FA280] text-white py-2 px-4 rounded-lg shadow w-full'
                                    onClick={() => navigate('/transact/deposit')}
                                >
                                    Fund Account
                                </motion.button>
                            </div>
                            <BadgeDollarSign className='text-[#0FA280] w-16 h-16 opacity-20 rotate-12' />
                        </div>
                    </section>

                    {/* More Options */}
                    <section className='mt-8 space-y-3'>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className='bg-white shadow-md p-4 rounded-xl flex items-center gap-4 cursor-pointer'
                            onClick={() => navigate('/profile/edit')}
                        >
                            <Pencil className='text-[#0FA280]' />
                            <p className='text-sm font-semibold text-gray-800'>Edit Profile</p>
                            <ChevronRight className='ml-auto text-gray-500' />
                        </motion.div>

                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className='bg-white shadow-md p-4 rounded-xl flex items-center gap-4 cursor-pointer'
                            onClick={() => navigate('/transactions')}
                        >
                            <History className='text-[#0FA280]' />
                            <p className='text-sm font-semibold text-gray-800'>Transaction History</p>
                            <ChevronRight className='ml-auto text-gray-500' />
                        </motion.div>

                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className='bg-white shadow-md p-4 rounded-xl flex items-center gap-4 cursor-pointer'
                            onClick={() => navigate('/settings')}
                        >
                            <Settings className='text-[#0FA280]' />
                            <p className='text-sm font-semibold text-gray-800'>Settings</p>
                            <ChevronRight className='ml-auto text-gray-500' />
                        </motion.div>
                    </section>
                </div>

                <Footer page='profile' />
            </div>
        </div>
    );
};

export default Profile;
