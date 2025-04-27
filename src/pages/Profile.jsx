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

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [accent, setAccent] = useState(localStorage.getItem('accent') || '#0FA280');


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setBalance(userSnap.data().availableBalance || 0);
                        setTheme(userSnap.data().theme || 'light');
                        setAccent(userSnap.data().accent || '#0FA280');
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
        <div className={`${theme === "dark" ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br'} ${theme === "dark" ? '' : `from-[${accent}] to-[${accent}]`} text-white font-sans`} style={{ filter: theme === "dark" ? 'none' : 'brightness(0.9)' }}>
            <div className='min-h-screen max-w-3xl px-3 flex flex-col items-center mx-auto pb-20 relative z-50'>
                {isLoggingOut || loading ? <Barloader /> : null}

                <div className='w-full py-5 flex flex-col flex-grow'>
                    {/* Header */}
                    <header className='w-full flex items-center gap-3 mb-6'>
                        <button onClick={() => navigate('/dashboard')}>
                            <ArrowLeft className='text-white w-6 h-6 cursor-pointer' />
                        </button>
                        <LogOut onClick={handleLogout} className='text-white w-6 h-6 ml-auto cursor-pointer' />
                        <Bell className='text-white w-6 h-6 cursor-pointer' />
                    </header>

                    {/* User Info */}
                    <div className={`${theme === "dark" ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg px-6 py-4 rounded-2xl flex items-center justify-between`}>
                        <div>
                            <h1 className='text-base sm:text-lg font-semibold'>Hi, {user?.displayName || 'User'}</h1>
                            <p className={`text-xs sm:text-base ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                            {user?.metadata?.creationTime && (
                                <p className={`text-xs sm:text-base ${theme === "dark" ? 'text-gray-500' : 'text-gray-400'}`}>
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
                    <section className='mt-4'>
                        <div className={`${theme === "dark" ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'} shadow-md rounded-2xl p-5 border ${theme === "dark" ? 'border-gray-700' : 'border-gray-300'} flex justify-between items-center overflow-hidden`}>
                            <div>
                                <h1 className={`font-semibold text-sm ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>Available Balance</h1>
                                <p className='text-lg font-bold mt-1'>₦ {balance?.toLocaleString() || '0'}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`mt-4 py-2 px-4 rounded-lg shadow w-full`}
                                    style={
                                        {
                                            backgroundColor: accent,
                                            color: accent === '#D4F1F4' || accent === '#75E6DA' ? 'black' : 'white',
                                        }
                                    }
                                    onClick={() => navigate('/transact/deposit')}
                                >
                                    Fund Account
                                </motion.button>
                            </div>
                            <BadgeDollarSign style={{ color: accent }} className='w-16 h-16 opacity-20 rotate-12 scale-400' />
                        </div>
                    </section>

                    {/* More Options */}
                    <section className='mt-4 space-y-2'>
                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className={`${theme === "dark" ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md p-4 rounded-xl flex items-center gap-4 cursor-pointer`}
                            onClick={() => navigate('/transactions')}
                        >
                            <History style={{ color: accent }} />
                            <p className='text-sm font-semibold'>Transaction History</p>
                            <ChevronRight className={`ml-auto ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'}`} />
                        </motion.div>

                        <motion.div
                            whileTap={{ scale: 0.97 }}
                            className={`${theme === "dark" ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md p-4 rounded-xl flex items-center gap-4 cursor-pointer`}
                            onClick={() => navigate('/settings')}
                        >
                            <Settings style={{ color: accent }} />
                            <p className='text-sm font-semibold'>Settings</p>
                            <ChevronRight className={`ml-auto ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'}`} />
                        </motion.div>
                    </section>
                </div>

                <Footer page='profile' />
            </div>
        </div>);
};

export default Profile;
