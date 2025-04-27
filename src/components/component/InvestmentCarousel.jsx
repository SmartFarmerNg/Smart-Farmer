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
        }, 60000);

        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        if (userId) return;

        const investmentsRef = collection(db, "users", userId, "investments");
        const userRef = doc(db, "users", userId);

        const unsubscribe = onSnapshot(investmentsRef, async (querySnapshot) => {
            const updatedInvestments = [];
            const now = new Date();

            for (const docSnap of querySnapshot.docs) {
                const inv = { id: docSnap.id, ...docSnap.data() };
                const start = inv.startDate?.toDate?.() || null;

                if (start && now >= start && inv.status === 'Pending') {
                    await updateDoc(docSnap.ref, { status: 'Active' });
                    inv.status = 'Active';
                }

                const progress = getProgress(inv);
                const daysLeft = getDaysLeft(inv);

                if (
                    progress >= 100 &&
                    daysLeft === 0 &&
                    inv.status === 'Active' &&
                    typeof inv.investmentAmount === 'number' &&
                    typeof inv.expectedROI === 'number'
                ) {
                    const roi = (inv.investmentAmount * inv.expectedROI) / 100;
                    const totalReturn = inv.investmentAmount + roi;

                    // Update balances first to avoid race conditions
                    await updateDoc(userRef, {
                        availableBalance: increment(totalReturn),
                        investmentBalance: increment(-inv.investmentAmount),
                    });

                    await updateDoc(docSnap.ref, {
                        status: 'Completed',
                        completedAt: new Date(),
                    });

                    inv.status = 'Completed';
                }

                updatedInvestments.push(inv);
            }

            setinvestment(updatedInvestments);
        });

        return () => unsubscribe();
    }, [userId]);

    const getProgress = (inv) => {
        const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
        const start = new Date(startRaw);

        const totalDays = inv.productName === 'Fast Vegetables'
            ? inv.investmentPeriod
            : inv.investmentPeriod * 30;
        const duration = totalDays * 24 * 60 * 60 * 1000; // convert days to ms
        const elapsed = currentTime - start;
        const percentage = (elapsed / duration) * 100;
        return Math.min(Math.max(percentage, 0), 100); // clamp between 0-100
    };

    const getDaysLeft = (inv) => {
        const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
        const start = new Date(startRaw);
        const now = new Date();

        const totalDays = inv.productName === 'Fast Vegetables'
            ? inv.investmentPeriod
            : inv.investmentPeriod * 30;

        const daysElapsed = (now - start) / (1000 * 60 * 60 * 24);
        return Math.max(0, Math.ceil(totalDays - daysElapsed));
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
                    {investment.map((investment, index) => {
                        const progress = getProgress(investment);
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
                                </div>

                                <div className="w-20 h-20 mt-4 self-center">
                                    <CircularProgressbar
                                        value={progress}
                                        text={progress === 100 ? '✓' : `${Math.round(progress)}%`}
                                        styles={buildStyles({
                                            textSize: "28px",
                                            textColor: progress === 100 ? `${accent}` : theme === "dark" ? 'white' : "#0FA280",
                                            pathColor: progress === 100 ? `${accent}` : theme === "dark" ? 'white' : "#0FA280", trailColor: theme === "dark" ? "#4B5563" : "#d1d5dc",
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
