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
        { label: 'Balance', amount: '$1,500', Icon: Banknote }
    ], []);

    const crops = useMemo(() => [
        { crop: 'Maize', investmentReturn: '10%', duration: '2 months' },
        { crop: 'Cassava', investmentReturn: '15%', duration: '6 months' },
        { crop: 'Cocoa', investmentReturn: '15%', duration: '4 months' },
        { crop: 'Palm Oil', investmentReturn: '18%', duration: '4 months' },
        { crop: 'Maize', investmentReturn: '10%', duration: '2 months' },
        { crop: 'Cassava', investmentReturn: '15%', duration: '6 months' },
        { crop: 'Cocoa', investmentReturn: '15%', duration: '4 months' },
        { crop: 'Palm Oil', investmentReturn: '18%', duration: '4 months' },
    ], []);

    if (loading) return <Barloader />;

    return (
        <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto bg-white text-gray-900 py-6 mb-14 font-sans'>
            <motion.h1
                className='text-sm font-semibold bg-gray-100 shadow-md px-8 py-4 rounded-xl w-full'
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Welcome, {user?.displayName || 'User'} 👋
            </motion.h1>

            <div className='flex gap-6 mt-6 w-full mx-auto'>
                {financeData.map(({ label, amount, Icon }, index) => (
                    <div
                        key={index}
                        className='bg-gray-100 shadow-md w-full mx-auto flex gap-3 px-6 py-4 rounded-xl border border-gray-300 overflow-hidden relative'
                    >
                        <div className='text-left'>
                            <p className='text-sm font-semibold'>{label}</p>
                            <p className='text-lg font-semibold'>{amount}</p>
                        </div>
                        <Icon className='w-16 h-16 text-[#0FA280] scale-250 -rotate-20 opacity-20 absolute right-10 top-3' />
                    </div>
                ))}
            </div>

            <section className="w-full max-w-2xl mt-8 p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200">
                <input
                    type="text"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0FA280] transition-all sticky top-2 z-10"
                    placeholder="Search crop..."
                />

                <h2 className="text-xl font-bold mt-6 text-gray-900">Top Crops to Invest In</h2>

                <div className="grid grid-cols-1 gap-4 mt-4">
                    {crops.map((data, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/50 backdrop-blur-lg shadow-md p-5 rounded-xl text-center font-semibold border border-gray-300 transition-all flex justify-between items-center"
                        >
                            <div className="text-lg text-gray-800">{data.crop}</div>
                            <div className="text-[#0FA280] font-bold text-sm mt-1 flex items-center gap-1">{data.investmentReturn} / <p className='text-gray-400 text-xs'>{data.duration}</p></div>
                        </motion.div>
                    ))}
                </div>
            </section>


            <Footer page='dashboard' />
        </div>
    );
};

export default Dashboard;
