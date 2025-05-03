import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect, useState } from "react";

const InvestProductPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";
    const investment = state?.investment;

    if (!investment) {
        return (
            <div className="p-6">
                <p className="text-red-500 font-semibold">No investment data found.</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

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


    const getDaysLeft = (inv) => {
        const startRaw = inv.productName === 'Fast Vegetables' ? inv.createdAt : inv.startDate;
        const start = new Date(startRaw);
        const now = new Date();

        const totalDays = inv.productName === 'Fast Vegetables'
            ? inv.investmentPeriod
            : inv.investmentPeriod * 30;

        const msLeft = (start.getTime() + (totalDays * 24 * 60 * 60 * 1000)) - now.getTime();
        const daysLeft = Math.floor(msLeft / (1000 * 60 * 60 * 24));

        if (daysLeft < 1 && msLeft > 0) {
            const hoursLeft = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
            return `${hoursLeft}h ${minutesLeft}m`;
        }

        return `${Math.max(0, Math.ceil(daysLeft))}  day${daysLeft !== 1 ? 's' : ''} `;
    };

    const [progress, setProgress] = useState(getProgress(investment));
    const [daysLeft, setDaysLeft] = useState(getDaysLeft(investment));

    // Update every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(getProgress(investment));
            setDaysLeft(getDaysLeft(investment));
        }, 60000);

        return () => clearInterval(interval);
    }, [investment]);

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
        <div className={`min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-[#0FA280] to-[#054D3B]'}`}>
            <div className={`w-full max-w-2xl mx-auto mt-8 p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-md z-50`}>
                <h1 className="text-2xl font-bold text-center mb-4">{investment.productName}</h1>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <p><strong>Amount:</strong> ₦{investment.investmentAmount.toLocaleString()}</p>
                        {investment.productName !== 'Fast Vegetables' && <p><strong>Units Bought:</strong> {investment.unitsBought}</p>}
                        <p><strong>ROI:</strong> {investment.expectedROI}%</p>
                        {investment.productName === 'Fast Vegetables' ? <p><strong>Start Date:</strong> {new Date(investment.createdAt).toLocaleDateString()}</p>
                            : <>
                                <p><strong>Start Date:</strong> {new Date(investment.startDate).toLocaleDateString()}</p>
                                <p><strong>Invested At:</strong> {new Date(investment.createdAt).toLocaleDateString()}</p>
                            </>
                        }
                        <p><strong>Duration:</strong> {investment.investmentPeriod} {investment.productName === "Fast Vegetables" ? `day${investment.investmentPeriod !== 1 ? 's' : ''}` : 'months'}</p>
                        {investment.status === 'Active' && <p><strong>Time Left:</strong> {daysLeft}</p>}
                        <p className={`${investment.status === 'Active' ? 'text-blue-500' : investment.status === 'Pending' ? 'text-amber-400' : 'text-green-500'} font-semibold`}><strong className={theme === 'dark' ? 'text-white' : 'text-black'}>Status:</strong> {investment.status}</p>
                        <p><strong>{investment.status === 'Completed' ? 'Profit' : 'Expected Profit'}:</strong> ₦{((investment.investmentAmount * investment.expectedROI) / 100).toLocaleString()}</p>
                        <p><strong>{investment.status === 'Completed' ? 'Payout' : 'Expected Payout'}:</strong> ₦{((investment.investmentAmount * investment.expectedROI) / 100 + investment.investmentAmount).toLocaleString()}</p>
                    </div>
                    <div className="w-32 h-32 mx-auto sm:mx-0">
                        <CircularProgressbar
                            value={progress}
                            text={progress === 100 ? '✓' : `${Math.round(progress)}%`}
                            styles={buildStyles({
                                textSize: "28px",
                                textColor: progress === 100 ? `${accent}` : getProgressColor(progress),
                                pathColor: progress === 100 ? `${accent}` : getProgressColor(progress),
                                trailColor: theme === "dark" ? "#4B5563" : "#d1d5dc",
                            })}
                        />
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'} text-white rounded transition`}
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>);
};

export default InvestProductPage;
