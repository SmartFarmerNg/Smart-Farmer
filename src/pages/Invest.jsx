import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/component/Footer';
import { motion } from 'framer-motion';
import FloatingBackground from '../components/component/FloatingBackground';

const Invest = () => {
  const [investmentOptions, setInvestmentOptions] = useState([]);
  const navigate = useNavigate();

  // Fetch dynamic investment options (this is a mock; replace it with actual fetch)
  useEffect(() => {
    // Replace with actual API call or data fetching logic
    setInvestmentOptions(['Agro', 'Real Estate', 'Tech', 'Energy', 'Startups']);
  }, []);

  const handleOptionClick = (option) => {
    // Navigate to a specific page based on the investment option selected
    navigate(`/invest/${option.toLowerCase()}`);
  };

  return (
    <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans'>
      <FloatingBackground />
      <div className='min-h-screen max-w-2xl px-3 flex flex-col items-center mx-auto py-6 pb-14 -z-50'>
        <header className='w-full mx-auto flex items-center gap-3 mb-6'>
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className='text-white w-6 h-6' />
          </button>
          <h1 className='text-lg font-semibold text-white'>Investment</h1>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='w-full bg-white shadow-md p-6 rounded-2xl border border-gray-300'>
          <h2 className='text-xl font-bold mb-4 text-gray-900'>Choose an Investment</h2>
          <div className='grid grid-cols-2 gap-4'>
            {investmentOptions.map((option, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='bg-gray-100 shadow-md p-4 rounded-lg text-center font-semibold text-gray-900 cursor-pointer'
                onClick={() => handleOptionClick(option)}>
                {option}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <Footer page='invest' />
      </div>
    </div>
  );
};

export default Invest;
