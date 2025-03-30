import { Banknote, Briefcase } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'User',
                    photoURL: currentUser.photoURL,
                });
            } else {
                setTimeout(() => navigate('/sign-in'), 1500);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const financeData = useMemo(() => [
        { label: 'Cash', amount: '$150,250', Icon: Banknote },
        { label: 'Assets', amount: '$530,000', Icon: Briefcase }
    ], []);

    const crops = useMemo(() => ['Maize', 'Cassava', 'Cocoa', 'Palm Oil'], []);

    if (loading) return <Barloader />;

    return (
        <div className='min-h-screen flex flex-col items-center bg-gradient-to-br from-[#E7F6F2] to-[#B2DFDB] text-gray-900 py-6 font-sans'>
            <motion.h1
                className='text-2xl font-bold bg-white/30 backdrop-blur-lg shadow-lg px-8 py-4 rounded-2xl'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Welcome, {user?.displayName || 'User'} 👋
            </motion.h1>

            <div className='flex gap-6 mt-6'>
                {financeData.map(({ label, amount, Icon }, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className='bg-white/30 backdrop-blur-lg shadow-lg flex gap-3 px-6 py-4 rounded-2xl border border-gray-300'
                    >
                        <Icon className='w-6 h-6 text-gray-700' />
                        <div className='text-left'>
                            <p className='text-sm font-semibold'>{label}</p>
                            <p className='text-lg font-semibold'>{amount}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <section className='w-full max-w-2xl mt-8 p-6 bg-white/30 backdrop-blur-lg shadow-lg rounded-2xl border border-gray-300'>
                <input
                    type='text'
                    className='w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0FA280]'
                    placeholder='Search investments...'
                />
                <h2 className='text-xl font-bold mt-4'>Top Crops to Invest In</h2>
                <div className='grid grid-cols-2 gap-4 mt-4'>
                    {crops.map((crop, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='bg-gray-100/50 shadow-lg p-4 rounded-lg text-center font-semibold'
                        >
                            {crop}
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer page='dashboard' />
        </div>
    );
};

export default Dashboard;
