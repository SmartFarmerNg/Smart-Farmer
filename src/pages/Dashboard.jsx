import { Banknote, CircleDollarSign, EyeClosed, LoaderIcon } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';
import InvestmentsCarousel from '../components/component/InvestmentCarousel';
import CropsSection from '../components/component/cropsSection';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import QuickInvestCard from '../components/component/QuickInvestCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState(null);
  const [investmentBalance, setInvestmentBalance] = useState(null);
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);

  const [quickInvestments, setQuickInvestments] = useState([]);
  const viewBalance = localStorage.getItem('showBalance') === 'true';
  const [showBalance, setShowBalance] = useState(viewBalance);


  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accent, setAccent] = useState(localStorage.getItem('accent') || '#0FA280');

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
      const unsubscribe = onSnapshot(userRef, (userSnap) => {
        setAvailableBalance(userSnap.exists() ? userSnap.data().availableBalance || 0 : 0);
        setInvestmentBalance(userSnap.exists() ? userSnap.data().investmentBalance || 0 : 0);
        setTheme(userSnap.data().theme || 'light');
        localStorage.setItem('theme', userSnap.data().theme || 'light');
        setAccent(userSnap.data().accent || '#0FA280');
        localStorage.setItem('accent', userSnap.data().accent || '#0FA280');
      });
      return unsubscribe;
    } catch (error) {
      if (error.code?.includes("offline")) {
        toast.error("You are offline. Please check your internet connection.");
      }
      console.error('Error fetching balance:', error);
      setAvailableBalance(0);
      setInvestmentBalance(0);
    }
  };
  // Fetch crops data
  useEffect(() => {
    const fetchCrops = async () => {
      setCropsLoading(true);
      try {
        const cropsRef = collection(db, 'investmentProducts');
        const unsubscribe = onSnapshot(cropsRef, (snapshot) => {
          const cropsData = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || doc.id,
            ...doc.data()
          }));
          setCrops(cropsData);
          setCropsLoading(false);
        });
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching investment products:', error);
        setCrops([]);
        setCropsLoading(false);
      }
    };
    const unsubscribe = fetchCrops();
    return () => unsubscribe;
  }, []);


  useEffect(() => {
    const fetchInvestments = async () => {
      if (user?.uid) {
        try {
          const investmentsRef = collection(db, "users", user.uid, "investments");
          const unsubscribe = onSnapshot(investmentsRef, async (snapshot) => {
            const updatedInvestments = [];
            const now = new Date();

            for (const docSnap of snapshot.docs) {
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
          });
          return unsubscribe;
        } catch (error) {
          console.error("Error fetching/updating investments:", error);
        }
      }
    };

    const unsubscribe = fetchInvestments();
    return () => unsubscribe;
  }, [user]);


  useEffect(() => {
    const fetchQuickInvestments = async () => {
      try {
        const quickInvestmentsRef = collection(db, "quickInvestments");
        const unsubscribe = onSnapshot(quickInvestmentsRef, (snapshot) => {
          const quickInvestmentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setQuickInvestments(quickInvestmentsData);
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching quick investments:", error);
        setQuickInvestments([]);
      }
    };

    if (user?.uid) {
      const unsubscribe = fetchQuickInvestments();
      return () => unsubscribe;
    }
  }, [user]);

  const openQuickInvestments = useMemo(
    () => quickInvestments.filter(inv => inv.status === "open"),
    [quickInvestments]
  );



  const financeData = useMemo(() => [
    {
      label: 'Available Balance',
      amount: typeof availableBalance === 'number' ? availableBalance : 0,
      Icon: Banknote,
    },
    {
      label: 'Total Balance',
      amount:
        (typeof availableBalance === 'number' ? availableBalance : 0) +
        (typeof investmentBalance === 'number' ? investmentBalance : 0),
      Icon: Banknote,
    },
  ], [availableBalance, investmentBalance]);


  return (
    <div className={`${theme === "dark" ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white' : 'text-black'} font-sans h-screen overflow-scroll`}>
      {loading && <Barloader />}
      <div className='min-h-screen max-w-3xl px-3 flex flex-col items-center mx-auto py-6 pb-20 z-50 relative'>
        <motion.h1
          className={`text-sm font-semibold ${theme === "dark" ? ' bg-gray-800' : 'bg-gray-200'} shadow-md px-8 py-4 rounded-xl w-full`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome, {user?.displayName || 'User'} 👋
        </motion.h1>

        <div className='flex gap-6 mt-4 w-full mx-auto'>
          <div
            className={`${theme === "dark" ? 'bg-gray-800' : 'bg-gray-200 border border-gray-300'} shadow-md w-full mx-auto flex flex-col gap-5 px-6 py-4 rounded-xl overflow-hidden relative`}
          >
            {financeData.map(({ label, amount, Icon }, index) => (
              <button
                key={index}
                className='text-left w-fit' onClick={() => {
                  setShowBalance(!showBalance)
                  localStorage.setItem('showBalance', !showBalance)
                }}>
                <p className='text-xs flex items-center'>
                  {label}
                  <span
                    className="p-1 rounded-full hover:bg-gray-200 cursor-pointer"
                  >
                    {showBalance ? <Eye size={14} className="font-bold" /> : <EyeOff size={14} className="font-bold" />}
                  </span>
                </p>
                <p className='text-sm font-bold flex items-center gap-1'>
                  NGN {typeof amount === 'number' ?
                    showBalance ? amount.toLocaleString() : '****'
                    : <LoaderIcon className='animate-spin duration-2000 inline-flex w-4 h-4' />}
                </p>
                <Icon style={{ color: accent }} className={`w-16 h-16 scale-250 -rotate-20 opacity-20 absolute left-5 top-3`} />
                <CircleDollarSign style={{ color: accent }} className={`w-16 h-16 scale-250 rotate-20 opacity-20 absolute right-10 top-3`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 mx-auto z-10 w-[90%] max-w-3xl px-2">
          {investments.length > 0 && <InvestmentsCarousel investments={investments} theme={theme} accent={accent} userId={user.uid} />}
        </div>
        {openQuickInvestments.length > 0 && (
          <QuickInvestCard investment={openQuickInvestments[0]} theme={theme} accent={accent} />
        )}
        <CropsSection crops={crops} cropsLoading={cropsLoading} theme={theme} accent={accent} />
      </div>
    </div >
  );
};

export default Dashboard;