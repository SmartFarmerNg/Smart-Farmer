import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const InvestmentsCarousel = ({ investments, theme, accent, userId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [investment, setinvestment] = useState(investments);
    const containerRef = useRef(null);


    const nextSlide = () => {
        setCurrentIndex((prev) => (prev < investment.length - 1 ? prev + 1 : 0));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : investment.length - 1));
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // Update every second instead of minute for more accurate tracking

        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        if (!userId) return;

        const investmentsRef = collection(db, "users", userId, "investments");

        const unsubscribe = onSnapshot(investmentsRef, (querySnapshot) => {
            const updatedInvestments = querySnapshot.docs.map(docSnap => {
                const inv = { id: docSnap.id, ...docSnap.data() };
                return {
                    ...inv,
                    progress: getProgress(inv, currentTime),
                    daysLeft: getDaysLeft(inv, currentTime)
                };
            });

            setinvestment(updatedInvestments);
        });

        return () => unsubscribe();
    }, [userId, currentTime]);

    const getProgress = (inv, currentTime) => {
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

    const getDaysLeft = (inv, currentTime) => {
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

    const getDaysLeftColor = (daysLeft) => {
        if (daysLeft <= 7) {
            return "#FF5733";
        } else if (daysLeft <= 14) {
            return "#FFC300";
        } else {
            return "#0FA280";
        }
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



    return (
        <div className="relative w-[90%] max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white text-center mb-4">Your Investments</h2>
            {/* Slider Container */}
            <div className="relative overflow-hidden rounded-xl">
                <motion.div
                    ref={containerRef}
                    className="flex gap-4"
                    animate={{ x: -currentIndex * 295 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {investment
                        .sort((a, b) => {
                            if (a.status === 'Active' && b.status !== 'Active') return -1;
                            if (a.status !== 'Active' && b.status === 'Active') return 1;
                            return 0;
                        })
                        .map((investment, index) => {
                            const progress = getProgress(investment, currentTime);
                            const daysLeft = getDaysLeft(investment, currentTime);
                            return (
                                <div
                                    key={index}
                                    className={`${theme === "dark" ? 'bg-gray-800' : 'bg-gray-200'} text-white font-sans shadow-md rounded-xl p-4 min-w-[280px] flex justify-between`}
                                >
                                    <div>
                                        <p className={`font-semibold ${theme === "dark" ? 'text-white' : 'text-gray-800'}`}>{investment.productName}</p>
                                        {investment.productName !== 'Fast Vegetables' && <p className={`text-sm ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>Units: {investment.unitsBought}</p>}
                                        <p className={`text-sm ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>Amount: ₦{investment.investmentAmount.toLocaleString()}</p>
                                        {investment.productName === 'Fast Vegetables' ? <p className={`text-sm ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>Start: {new Date(investment.createdAt).toLocaleDateString()}</p>
                                            : <>
                                                <p className={`text-sm ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>Start: {new Date(investment.startDate).toLocaleDateString()}</p>
                                            </>
                                        }

                                        {/* days left */}
                                        <p className={`text-sm ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}
                                            style={
                                                {
                                                    color: getDaysLeftColor(daysLeft),
                                                }
                                            }>
                                            {investment.status === 'Completed' ? 'Status: Completed' :
                                                investment.status === 'Pending' ? 'Status: Pending' :
                                                    `Time Left: ${daysLeft}`}
                                        </p>
                                    </div>

                                    <div className="w-20 h-20 mt-4 self-center">
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
                                </div>
                            );
                        })}
                </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -left-12">
                <button onClick={prevSlide} className={`${theme === "dark" ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-full shadow transition cursor-pointer`}>
                    <ChevronLeft className={`w-5 h-5 ${theme === "dark" ? 'text-white' : 'text-gray-800'}`} />
                </button>
            </div>

            <div className="absolute top-1/2 -right-12">
                <button onClick={nextSlide} className={`${theme === "dark" ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-full shadow transition cursor-pointer`}>
                    <ChevronRight className={`w-5 h-5 ${theme === "dark" ? 'text-white' : 'text-gray-800'}`} />
                </button>
            </div>
        </div>
    );
};

export default InvestmentsCarousel;
