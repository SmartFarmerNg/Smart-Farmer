import { Banknote, CircleDollarSign, EyeClosed, LoaderIcon } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';
import InvestmentsCarousel from '../components/component/InvestmentCarousel';
import CropsSection from '../components/component/cropsSection';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(null);
    const [showBalance, setShowBalance] = useState(false);
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
            if (error.code?.includes("offline")) {
                toast.error("You are offline. Please check your internet connection.");
            }
            console.error('Error fetching balance:', error);
            setBalance(0);
        }
    };

    // Fetch crops data
    useEffect(() => {
        const fetchCrops = async () => {
            setCropsLoading(true);
            try {
                const cropsRef = collection(db, 'investmentProducts');
                const cropsSnapshot = await getDocs(cropsRef);
                const cropsData = cropsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || doc.id,
                    ...doc.data()
                }));
                setCrops(cropsData);
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
                    const updatedInvestments = [];

                    const now = new Date();

                    for (const docSnap of querySnapshot.docs) {
                        const inv = docSnap.data();
                        const start = inv.startDate?.toDate?.() || null;

                        // If the startDate is reached and status is still "Pending", update it
                        if (start && now >= start && inv.status === 'Pending') {
                            await updateDoc(docSnap.ref, {
                                status: 'Active',
                            });
                            inv.status = 'Active'; // reflect change locally too
                        }

                        updatedInvestments.push(inv);
                    }

                    setInvestments(updatedInvestments);
                } catch (error) {
                    console.error("Error fetching/updating investments:", error);
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
        <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans overflow-scroll h-screen'>
            {/* <FloatingBackground /> */}
            {loading && <Barloader />}
            <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto py-6 pb-20 z-50'>
                <motion.h1
                    className='text-sm font-semibold bg-gray-100 shadow-md px-8 py-4 rounded-xl w-full z-50'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Welcome, {user?.displayName || 'User'} 👋
                </motion.h1>

                <div className='flex gap-6 mt-4 w-full mx-auto z-50'>
                    {financeData.map(({ label, amount, Icon }, index) => (
                        <div
                            key={index}
                            className='bg-gray-100 shadow-md w-full mx-auto flex gap-3 px-6 py-4 rounded-xl border border-gray-300 overflow-hidden relative'
                        >
                            <button className='text-left z-50' onClick={() => setShowBalance(() => !showBalance)}>
                                <p className='text-xs flex items-center'>
                                    {label}
                                    <button
                                        className="p-1 rounded-full hover:bg-gray-200 cursor-pointer z-50"
                                    >
                                        {showBalance ? <Eye size={14} className="font-bold" /> : <EyeOff size={14} className="font-bold" />}
                                    </button>
                                </p>
                                <p className='text-sm font-bold flex items-center gap-1'>
                                    NGN {typeof amount === 'number' ?
                                        showBalance ? amount.toLocaleString() : '****'
                                        : <LoaderIcon className='animate-spin duration-1000 inline-flex w-4 h-4' />}
                                </p>
                            </button>
                            <Icon className='w-16 h-16 text-[#0FA280] scale-250 -rotate-20 opacity-20 absolute left-5 top-3' />
                            <CircleDollarSign className='w-16 h-16 text-[#0FA280] scale-250 rotate-20 opacity-20 absolute right-10 top-3' />
                        </div>
                    ))}
                </div>

                <div className="mt-6 mx-auto z-10 w-[90%] max-w-2xl px-2">
                    {investments.length > 0 && <InvestmentsCarousel investments={investments} />}
                </div>

                <CropsSection crops={crops} cropsLoading={cropsLoading} />
            </div>
        </div>
    );
};

export default Dashboard;