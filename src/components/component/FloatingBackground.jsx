import React, { useEffect, useState } from 'react'
import { BadgeDollarSign, BadgePoundSterling, Banknote, ChartLine, ChartSpline, CreditCard, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingBackground = () => {

    const [iconPositions, setIconPositions] = useState([]);

    useEffect(() => {
        // Initialize random positions for icons
        setIconPositions(iconComponents.map(() => getRandomPosition()));

        // Update positions every 6 seconds
        const interval = setInterval(() => {
            setIconPositions(iconComponents.map(() => getRandomPosition()));
        }, 6000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    // Function to generate random positions within viewport
    const getRandomPosition = () => ({
        top: `${Math.random() * 90}%`,  // Prevent clipping at edges
        left: `${Math.random() * 90}%`
    });

    const floatingVariants = {
        initial: { y: -10, opacity: 0 },
        animate: {
            y: [0, 15, -10],
            opacity: [0, 1, 1, 0],
            transition: {
                repeat: Infinity,
                duration: 6,
                ease: 'easeInOut'
            }
        }
    };

    // Icons to animate
    const iconComponents = [
        BadgeDollarSign,
        BadgePoundSterling,
        Banknote,
        ChartSpline,
        ChartLine,
        CreditCard,
        HandCoins
    ];
    return (
        <>
            {iconComponents.map((Icon, index) => (
                <motion.div
                    key={`icon-${index}-${iconPositions[index]?.top}-${iconPositions[index]?.left}`}
                    className='absolute opacity-50'
                    style={iconPositions[index]}
                    variants={floatingVariants}
                    initial='initial'
                    animate='animate'
                >
                    <Icon className="w-12 h-12 text-white" />
                </motion.div>
            ))
            }</>
    );
};

export default FloatingBackground