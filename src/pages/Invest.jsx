import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/component/Footer';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';
import { collection, doc, getDocs, increment, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CropsSection from '../components/component/cropsSection';
import QuickInvestCard from '../components/component/QuickInvestCard';


const Invest = () => {
  const [user, setUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);
  const [quickInvestments, setQuickInvestments] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;


  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [accent, setAccent] = useState(localStorage.getItem('accent') || '#0FA280');



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
    if (!auth.currentUser?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setTheme(doc.data().theme || 'light');
        setAccent(doc.data().accent || '#0FA280');
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const investmentsRef = collection(db, "users", user.uid, "investments");

    const unsubscribe = onSnapshot(investmentsRef, (querySnapshot) => {
      const updatedInvestments = [];

      querySnapshot.forEach((docSnap) => {
        const inv = { id: docSnap.id, ...docSnap.data() };
        const progress = getProgress(inv);
        const daysLeft = getDaysLeft(inv);

        updatedInvestments.push({ ...inv, progress, daysLeft });
      });

      setInvestments(updatedInvestments);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const quickInvestmentsRef = collection(db, "quickInvestments");
    const unsubscribe = onSnapshot(quickInvestmentsRef, (querySnapshot) => {
      const quickInvestmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuickInvestments(quickInvestmentsData);
    });

    return () => unsubscribe();
  }, [user]);



  const openQuickInvestments = useMemo(
    () => quickInvestments.filter(inv => inv.status === "open"),
    [quickInvestments]
  );

  useEffect(() => {
    const cropsRef = collection(db, 'investmentProducts');
    const unsubscribe = onSnapshot(cropsRef, (snapshot) => {
      setCropsLoading(true);
      try {
        const cropsData = snapshot.docs.map(doc => ({
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
    });

    return () => unsubscribe();
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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second instead of minute for more accurate tracking

    return () => clearInterval(timer);
  }, []);

  const getProgress = (inv) => {
    const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
    const start = startRaw instanceof Date ? startRaw : new Date(startRaw);

    const totalDays = inv.productName === 'Fast Vegetables'
      ? inv.investmentPeriod
      : inv.investmentPeriod * 30;

    const duration = totalDays * 24 * 60 * 60 * 1000;
    const elapsed = currentTime.getTime() - start.getTime();
    const percentage = (elapsed / duration) * 100;

    return Math.min(Math.max(percentage, 0), 100);
  };

  const getDaysLeft = (inv) => {
    const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
    const start = startRaw instanceof Date ? startRaw : new Date(startRaw);

    const totalDays = inv.productName === 'Fast Vegetables'
      ? inv.investmentPeriod
      : inv.investmentPeriod * 30;

    const msElapsed = currentTime.getTime() - start.getTime();
    const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    const daysLeft = totalDays - daysElapsed;

    if (daysLeft < 1 && daysLeft > 0) {
      const hoursLeft = Math.floor(daysLeft * 24);
      const minutesLeft = Math.floor((daysLeft * 24 - hoursLeft) * 60);
      return `${hoursLeft}h ${minutesLeft}m`;
    }

    return `${Math.max(0, Math.ceil(daysLeft))}  day${daysLeft !== 1 ? 's' : ''} `;
  };
  const getProgressColor = (progress) => {
    if (progress < 50) {
      return "#FF5733";
    } else if (progress < 75) {
      return "#FFC300";
    } else {
      return "#0FA280";
    }
  };

  const displayedInvestments = useMemo(() => {
    return sortedInvestments
      .filter(inv => statusFilter === 'All' || inv.status === statusFilter)
      .sort((a, b) => {
        if (sortBy === 'latest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'progress') {
          return getProgress(b) - getProgress(a);
        }
        return 0;
      });
  }, [sortedInvestments, statusFilter, sortBy]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const totalActiveInvestment = investments.filter(inv => inv.status === 'Active').reduce((sum, inv) => sum + inv.investmentAmount, 0);

  const totalExpectedReturn = investments.filter(inv => inv.status === 'Active').reduce((sum, inv) => {
    const roi = (inv.investmentAmount * inv.expectedROI) / 100;
    return sum + roi;
  }, 0);

  const activeCount = investments.filter(inv => inv.status === 'Active').length;
  const pendingCount = investments.filter(inv => inv.status === 'Pending').length;
  const completedCount = investments.filter(inv => inv.status === 'Completed').length;


  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;


  return (

    <div className={`${theme === "dark" ? 'bg-gradient-to-br from-gray-800 to-gray-900' : ''} text-gray-200 font-sans h-screen overflow-y-scroll`}>
      <div className='min-h-screen max-w-3xl px-3 flex flex-col items-center mx-auto py-6 pb-20 z-50 relative'>
        <header className='w-full mx-auto flex items-center gap-3 mb-6'>
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className={`w-6 h-6`} />
          </button>
          <h1 className={`text-lg font-semibold`}>Investment</h1>
        </header>

        {loading ? (
          <div className='text-center py-10'>
            <div className={`animate-spin h-6 w-6 border-4 ${theme === "dark" ? 'border-white border-t-transparent' : 'border-gray-800 border-t-transparent'} rounded-full mx-auto mb-3`} />
            <p >Loading investments...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`w-full ${theme === "dark" ? 'bg-gray-800' : 'bg-gray-200 text-gray-900'} shadow-md p-6 rounded-2xl ${theme === "dark" ? '' : 'border border-gray-300'} mb-6`}
            >
              <h2 className={`text-xl font-bold mb-4`}>Investment Summary</h2>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Total Invested</p>
                  <p className='text-lg font-bold text-green-700'>{formatCurrency(totalInvested)}</p>
                </div>
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Total Active Investments</p>
                  <p className='text-lg font-bold text-green-700'>{formatCurrency(totalActiveInvestment)}</p>
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
                <div className='bg-gray-100 p-4 rounded-lg shadow-sm'>
                  <p className='text-sm text-gray-500'>Completed Investments</p>
                  <p className='text-lg font-bold text-green-600'>{completedCount}</p>
                </div>
              </div>
            </motion.div>

            {openQuickInvestments.length > 0 && (
              <QuickInvestCard investment={openQuickInvestments[0]} theme={theme} accent={accent} />
            )}

            {/* Your Investment Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`w-full ${theme === "dark" ? 'bg-gray-800' : 'bg-gray-200 text-gray-900'} shadow-md p-6 rounded-2xl border border-gray-300 mb-6 z-10`}
            >
              <h2 className={`text-xl font-bold mb-4`}>Your Investments</h2>
              {investments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-center py-8 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  <img
                    src='assets\empty-prevew.png'
                    alt='No investments'
                    className='w-full mx-auto mb-3'
                  />
                  <p className='text-sm font-medium'>
                    No {statusFilter === 'All' ? '' : statusFilter.toLowerCase()} investments found.
                  </p>
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
                          className={`px-4 py-1 rounded-full text-sm font-medium transition cursor-pointer'
                            }`}
                          style={{
                            backgroundColor: statusFilter === status ? accent : '#d1d5dc',
                            color: statusFilter === status ? '#fff' : '#333',
                            fontWeight: statusFilter === status ? 'bold' : 'normal',
                          }}
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

                  {displayedInvestments
                    .slice(startIndex, endIndex)
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
                          className={`${theme === "dark" ? 'bg-gray-700 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} border rounded-xl p-4 shadow-sm flex justify-between items-center gap-4 cursor-pointer transition-colors`}
                        >
                          <div className='flex-1'>
                            <p className={`font-semibold ${theme === "dark" ? 'text-white' : 'text-gray-800'}`}>{inv.productName}</p>
                            {inv.productName !== "Fast Vegetables" ?

                              <p className={`text-xs ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                                Duration: {inv.investmentPeriod} months | ROI: {inv.expectedROI}% monthly
                              </p>
                              :
                              <p className={`text-xs ${theme === "dark" ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                                Duration: {inv.investmentPeriod} days | ROI: {inv.expectedROI / inv.investmentPeriod}% daily
                              </p>
                            }
                            <p className='text-green-600 font-semibold'>₦{inv.investmentAmount.toLocaleString()}</p>
                            <p className={`text-xs font-bold mt-1 ${inv.status === 'Active' ? 'text-blue-600' : theme === "dark" ? 'text-gray-400' : 'text-gray-500'}`}>
                              {inv.status}
                            </p>
                            {inv.status === 'Active' && (
                              <p className={`text-xs ${theme === "dark" ? 'text-gray-400' : 'text-gray-400'}`}>⏳ {daysLeft} left</p>
                            )}
                          </div>

                          <div className='w-16 h-16'>
                            <CircularProgressbar
                              value={progress}
                              text={progress === 100 ? '✓' : `${Math.round(progress)}%`}
                              styles={buildStyles({
                                textSize: "28px",
                                textColor: progress === 100 ? `${accent}` : getProgressColor(progress),
                                pathColor: progress === 100 ? `${accent}` : getProgressColor(progress),
                                trailColor: theme === "dark" ? "#4B5563" : "#d1d5dc",
                                pathTransition: "stroke-dashoffset 0.5s ease 0s",
                                transition: "stroke-dashoffset 0.5s ease 0s"
                              })}
                            />
                          </div>
                        </motion.div>
                      );
                    })}

                  {/* Pagination Controls */}
                  {investments && (
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed text-gray-900 disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        Previous
                      </button>

                      <span className={`px-2 py-2 text-sm font-semibold ${theme === "dark" ? 'text-white' : 'text-gray-800'}`}>
                        Page {currentPage} of {Math.ceil(displayedInvestments.length / itemsPerPage)}
                      </span>
                      <button
                        onClick={() => {
                          const totalPages = Math.ceil(
                            investments.filter(inv => statusFilter === 'All' || inv.status === statusFilter).length / itemsPerPage
                          );
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                        }}
                        disabled={
                          currentPage >= Math.ceil(
                            investments.filter(inv => statusFilter === 'All' || inv.status === statusFilter).length / itemsPerPage
                          )
                        }
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-45 disabled:cursor-not-allowed text-gray-900 disabled:bg-gray-300 disabled:text-gray-500"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Explore Investment Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`w-full shadow-md rounded-sm border-r z-10`}
            >
              <h2 className='text-xl font-bold mb-4'>Explore More Investments</h2>
              <CropsSection crops={crops} cropsLoading={cropsLoading} theme={theme} accent={accent} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Invest;
