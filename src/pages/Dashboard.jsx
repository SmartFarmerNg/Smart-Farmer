import { Banknote, CircleDollarSign, LoaderIcon } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(null);
    const [crops, setCrops] = useState([]);
    const [cropsLoading, setCropsLoading] = useState(true);

    // Fetch user authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'User',
                    photoURL: currentUser.photoURL,
                });
                fetchUserBalance(currentUser.uid);
            } else {
                navigate('/sign-in');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // Fetch user balance
    const fetchUserBalance = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            setBalance(userSnap.exists() ? userSnap.data().balance || 0 : 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setBalance(0);
        }
    };

    // Fetch crops data
    useEffect(() => {
        const fetchCrops = async () => {
            setCropsLoading(true);
            try {
                const cropsRef = collection(db, 'investmentProducts ');
                const cropsSnapshot = await getDocs(cropsRef);
                const cropsData = cropsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || doc.id,
                    ...doc.data()
                }));
                setCrops(cropsData);
                console.log(cropsData);

            } catch (error) {
                console.error('Error fetching investment products:', error);
                setCrops([]);
            } finally {
                setCropsLoading(false);
            }
        };
        fetchCrops();
    }, []);

    useEffect(() => {
        const fetchInvestments = async () => {
            if (user?.uid) {
                try {
                    const investmentsRef = collection(db, "users", user.uid, "investments");
                    const querySnapshot = await getDocs(investmentsRef);
                    const investmentData = querySnapshot.docs.map(doc => doc.data());
                    setInvestments(investmentData);
                } catch (error) {
                    console.error("Error fetching investments:", error);
                }
            }
        };

        if (user?.uid) {
            fetchInvestments();
        }
    }, [user]);



    const financeData = useMemo(() => [
        { label: 'Balance', amount: balance, Icon: Banknote }
    ], [balance]);

    return (
        <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans'>
            <FloatingBackground />
            {loading && <Barloader />}
            <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto py-6 pb-20'>
                <motion.h1
                    className='text-sm font-semibold bg-gray-100 shadow-md px-8 py-4 rounded-xl w-full'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Welcome, {user?.displayName || 'User'} 👋
                </motion.h1>

                <div className='flex gap-6 mt-4 w-full mx-auto'>
                    {financeData.map(({ label, amount, Icon }, index) => (
                        <div
                            key={index}
                            className='bg-gray-100 shadow-md w-full mx-auto flex gap-3 px-6 py-4 rounded-xl border border-gray-300 overflow-hidden relative'
                        >
                            <div className='text-left'>
                                <p className='text-xs'>{label}</p>
                                <p className='text-sm font-bold flex items-center gap-1'>
                                    NGN {typeof amount === 'number' ? amount.toLocaleString() : <LoaderIcon className='animate-spin duration-1000 inline-flex w-4 h-4' />}
                                </p>
                            </div>
                            <Icon className='w-16 h-16 text-[#0FA280] scale-250 -rotate-20 opacity-20 absolute left-5 top-3' />
                            <CircleDollarSign className='w-16 h-16 text-[#0FA280] scale-250 rotate-20 opacity-20 absolute right-10 top-3' />
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    {investments.length === 0 ? (
                        <p></p>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-[#0FA280]">Your Investment History</h2>
                            {investments.map((investment, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white shadow-md rounded-xl p-4"
                                >
                                    <p className="font-semibold">{investment.productName}</p>
                                    <p className="text-sm">Units Invested: {investment.unitsInvested}</p>
                                    <p className="text-sm">Investment Amount: NGN {investment.investmentAmount.toLocaleString()}</p>
                                    <p className="text-sm">Date: {new Date(investment.investmentDate).toLocaleDateString()}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                <section className="w-full max-w-2xl mt-4 p-6 bg-white/30 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200">
                    <input
                        type="text"
                        className="w-full p-3 px-6 bg-gray-100 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0FA280] transition-all sticky top-2 z-10"
                        placeholder="Search crop..."
                    />

                    <h2 className="text-xl font-bold mt-6 text-white">Top Crops to Invest In</h2>

                    {cropsLoading ? (
                        <p className="text-center text-gray-200 mt-4">Loading crops...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 mt-4">
                            {crops.map((data, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white backdrop-blur-lg shadow-md p-5 rounded-xl text-center font-semibold border border-gray-300 transition-all flex justify-between items-center"

                                >
                                    <div>
                                        <div className="text-lg text-gray-800">{data.name}</div>
                                        <div className="text-[#0FA280] font-bold text-sm mt-1 flex items-center gap-1">
                                            {data.expectedROI}% / <p className='text-gray-400 text-xs'>{data.investmentPeriod} months</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/product/${data.id}`, { state: { product: data } })}
                                        className='bg-[#0FA280] text-white py-2 px-4 rounded-lg hover:bg-[#0d8b6d] transition-all cursor-pointer'>Invest Now</button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
                <Footer page='dashboard' />
            </div>
        </div>
    );
};

export default Dashboard;
