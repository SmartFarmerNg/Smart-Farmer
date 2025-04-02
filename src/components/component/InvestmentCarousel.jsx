import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const InvestmentsCarousel = ({ investments }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);

    const nextSlide = () => {
        if (currentIndex < investments.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setCurrentIndex(0); // Loop back to the first item
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        } else {
            setCurrentIndex(investments.length - 1); // Loop back to the last item
        }
    };

    return (
        <div className="relative w-[90%] max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-white text-center mb-4">Your Investments</h2>

            {/* Slider Container */}
            <div className="relative overflow-hidden">
                <motion.div
                    ref={containerRef}
                    className="flex gap-4"
                    animate={{ x: -currentIndex * 295 }} // Moves the slider
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {investments.map((investment, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-md rounded-xl p-4 min-w-[280px]"
                        >
                            <p className="font-semibold">{investment.productName}</p>
                            <p className="text-sm">Units Invested: {investment.unitsInvested}</p>
                            <p className="text-sm">Investment Amount: NGN {investment.investmentAmount.toLocaleString()}</p>
                            <p className="text-sm">Date: {new Date(investment.investmentDate).toLocaleDateString()}</p>
                        </div>
                    ))}
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
