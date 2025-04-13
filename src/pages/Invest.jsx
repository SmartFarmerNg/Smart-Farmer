import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/component/Footer';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';
import { collection, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CropsSection from '../components/component/cropsSection';


const Invest = () => {
  const [investmentOptions, setInvestmentOptions] = useState([]);
  const [user, setUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);


  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || 'User',
          photoURL: currentUser.photoURL,
        });
      } else {
        navigate('/sign-in');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

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
    setInvestmentOptions(['Agro', 'Real Estate', 'Tech', 'Energy', 'Startups']);
  }, []);

  let sortedInvestments = [...investments];

  if (sortBy === 'progress') {
    sortedInvestments.sort((a, b) => {
      const getPercent = (item) => {
        const start = new Date(item.startDate).getTime();
        const end = new Date(item.endDate).getTime();
        const now = new Date().getTime();
        return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
      };
      return getPercent(b) - getPercent(a);
    });
  } else {
    sortedInvestments.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }

  const getProgress = (inv) => {
    const start = inv.startDate?.toDate?.() || new Date();
    const now = new Date();
    const duration = inv.investmentPeriod * 30 * 24 * 60 * 60 * 1000; // convert months to ms
    const elapsed = now - start;
    const percentage = (elapsed / duration) * 100;
    return Math.min(Math.max(percentage, 0), 100); // clamp between 0-100
  };

  const getDaysLeft = (inv) => {
    const start = inv.startDate?.toDate?.() || new Date();
    const now = new Date();
    const totalDays = inv.investmentPeriod * 30;
    const daysElapsed = (now - start) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(totalDays - daysElapsed));
  };


  const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);

  const totalExpectedReturn = investments.reduce((sum, inv) => {
    const roi = (inv.investmentAmount * inv.expectedROI) / 100;
    return sum + roi;
  }, 0);

  const activeCount = investments.filter(inv => inv.status === 'Active').length;
  const pendingCount = investments.filter(inv => inv.status === 'Pending').length;


  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;



  return (
    <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans overflow-scroll h-screen'>
      <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto py-6 pb-20'>
        <header className='w-full mx-auto flex items-center gap-3 mb-6'>
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className='text-white w-6 h-6' />
          </button>
          <h1 className='text-lg font-semibold text-white'>Investment</h1>
        </header>

        {loading ? (
          <div className='text-center py-10 text-white'>
            <div className='animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full mx-auto mb-3' />
            <p>Loading investments...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='w-full bg-white shadow-md p-6 rounded-2xl border border-gray-300 mb-6 z-50 relative'
            >
              <h2 className='text-xl font-bold mb-4 text-gray-900'>Investment Summary</h2>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Total Invested</p>
                  <p className='text-lg font-bold text-green-700'>{formatCurrency(totalInvested)}</p>
                </div>
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Expected ROI</p>
                  <p className='text-lg font-bold text-green-700'>{formatCurrency(totalExpectedReturn)}</p>
                </div>
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Active Investments</p>
                  <p className='text-lg font-bold text-blue-600'>{activeCount}</p>
                </div>
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Pending Investments</p>
                  <p className='text-lg font-bold text-blue-600'>{pendingCount}</p>
                </div>
              </div>
            </motion.div>

            {/* Your Investment Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='w-full bg-white shadow-md p-6 rounded-2xl border border-gray-300 mb-6 z-10'
            >
              <h2 className='text-xl font-bold mb-4 text-gray-900'>Your Investments</h2>
              {investments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-center text-gray-500 py-8'
                >
                  <img
                    src='/assets/empty-box.svg' // Replace with your own empty illustration
                    alt='No investments'
                    className='w-24 h-24 mx-auto mb-3 opacity-60'
                  />
                  <p className='text-sm font-medium'>You have no active investments yet.</p>
                  <p className='text-xs mt-1'>Explore investment options below to get started.</p>
                </motion.div>

              ) : (
                <div className='space-y-4'>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-3 flex-wrap">
                      {['All', 'Active', 'Completed', 'Pending'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-4 py-1 rounded-full text-sm font-medium transition cursor-pointer ${statusFilter === status ? 'bg-[#0FA280] text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0FA280]"
                    >
                      <option value="latest">Latest</option>
                      <option value="progress">Progress</option>
                    </select>
                  </div>


                  {investments
                    .filter(inv => statusFilter === 'All' || inv.status === statusFilter)
                    .sort((a, b) => {
                      if (sortBy === 'latest') {
                        return b.timestamp?.toDate() - a.timestamp?.toDate();
                      } else if (sortBy === 'progress') {
                        return getProgress(b) - getProgress(a);
                      }
                      return 0;
                    })
                    .map((inv, index) => {
                      const progress = getProgress(inv);
                      const daysLeft = getDaysLeft(inv);

                      return (
                        <motion.div
                          key={inv.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => navigate(`/invest/product/${inv.id}`, { state: { investment: inv } })}
                          className='bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm flex justify-between items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors'
                        >
                          <div className='flex-1'>
                            <p className='font-semibold text-gray-800'>{inv.productName}</p>
                            <p className='text-xs text-gray-500 mb-1'>
                              Duration: {inv.investmentPeriod} months | ROI: {inv.expectedROI}%
                            </p>
                            <p className='text-green-600 font-semibold'>₦{inv.investmentAmount.toLocaleString()}</p>
                            <p className={`text-xs font-bold mt-1 ${inv.status === 'Active' ? 'text-blue-600' : 'text-gray-500'}`}>
                              {inv.status}
                            </p>
                            {inv.status === 'Active' && (
                              <p className='text-xs text-gray-400'>⏳ {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</p>
                            )}
                          </div>

                          <div className='w-16 h-16'>
                            <CircularProgressbar
                              value={progress}
                              text={`${Math.round(progress)}%`}
                              styles={buildStyles({
                                textSize: '28px',
                                textColor: '#0FA280',
                                pathColor: '#0FA280',
                                trailColor: '#e6e6e6',
                              })}
                            />
                          </div>
                        </motion.div>);
                    })}
                </div>
              )}
            </motion.div>

            {/* Explore Investment Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className='w-full text-white shadow-md p-6 rounded-sm border-r border-l border-gray-300 z-10'
            >
              <h2 className='text-xl font-bold mb-4'>Explore More Investments</h2>
              <CropsSection crops={crops} cropsLoading={cropsLoading} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Invest;
