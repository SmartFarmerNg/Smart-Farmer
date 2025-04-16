import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const InvestmentsCarousel = ({ investments }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev < investments.length - 1 ? prev + 1 : 0));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : investments.length - 1));
    };

    const getProgress = (inv) => {
        const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
        const start = new Date(startRaw);
        const now = new Date();
        const totalDays = inv.productName === 'Fast Vegetables'
            ? inv.investmentPeriod
            : inv.investmentPeriod * 30;
        const duration = totalDays * 24 * 60 * 60 * 1000; // convert days to ms
        const elapsed = now - start;
        const percentage = (elapsed / duration) * 100;
        return Math.min(Math.max(percentage, 0), 100); // clamp between 0-100
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
                    {investments.map((investment, index) => {
                        const progress = getProgress(investment);
                        return (
                            <div
                                key={index}
                                className="bg-white shadow-md rounded-xl p-4 min-w-[280px] flex justify-between"
                            >
                                <div>
                                    <p className="font-semibold text-gray-800">{investment.productName}</p>
                                    <p className="text-sm text-gray-600">Units: {investment.unitsBought}</p>
                                    <p className="text-sm text-gray-600">Amount: ₦{investment.investmentAmount.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">Start: {new Date(investment.startDate?.seconds ? investment.startDate.toDate() : investment.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="w-20 h-20 mt-4 self-center">
                                    <CircularProgressbar
                                        value={progress}
                                        text={`${Math.round(progress)}%`}
                                        styles={buildStyles({
                                            textSize: "28px",
                                            textColor: "#0FA280",
                                            pathColor: "#0FA280",
                                            trailColor: "#e6e6e6",
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
                <button onClick={prevSlide} className="bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300 transition cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute top-1/2 -right-12">
                <button onClick={nextSlide} className="bg-gray-200 p-2 rounded-full shadow hover:bg-gray-300 transition cursor-pointer">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default InvestmentsCarousel;
