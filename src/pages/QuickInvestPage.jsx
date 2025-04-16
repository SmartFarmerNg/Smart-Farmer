import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import { Banknote, Calculator } from "lucide-react";

const InvestProductPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { investment } = location.state || {}; // Get the investment details passed from the QuickInvestCard

    const [userBalance, setUserBalance] = useState(0);
    const [user, setUser] = useState(null);
    const [investmentBalance, setInvestmentBalance] = useState(0);
    const [investmentAmount, setInvestmentAmount] = useState("");
    const [numberOfDays, setNumberOfDays] = useState(7); // Default to 30 days
    const [calculatedProfit, setCalculatedProfit] = useState(0);
    const [isInvesting, setIsInvesting] = useState(false);

    // Fetch user balance from Firestore
    useEffect(() => {
        const fetchUserBalance = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            setUser(user);
            if (user?.uid) {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                setUserBalance(userSnap.exists() ? userSnap.data().availableBalance || 0 : 0);
                setInvestmentBalance(userSnap.exists() ? userSnap.data().investmentBalance || 0 : 0);
            } else {
                toast.error("Please log in to invest.");
                navigate("/sign-in");
            }
        };
        fetchUserBalance();
    }, [navigate]);

    // Investment calculation function
    const calculateProfit = (amount, days) => {
        if (!amount || amount <= 0 || isNaN(amount)) return 0;
        const dailyROI = investment?.expectedROI || 0;
        const profit = amount * (dailyROI / 100) * days;
        setCalculatedProfit(profit);
    };

    const handleInvestmentChange = (e) => {
        const amount = e.target.value;
        setInvestmentAmount(amount);
        calculateProfit(amount, numberOfDays); // Recalculate profit on amount change
    };

    const handleDaysChange = (e) => {
        const days = e.target.value;
        setNumberOfDays(days);
        calculateProfit(investmentAmount, days); // Recalculate profit on days change
    };

    const handleInvestNow = async () => {
        if (investmentAmount <= 0 || isNaN(investmentAmount)) {
            toast.error("Please enter a valid investment amount.");
            return;
        }

        if (investmentAmount < investment.minimumInvestment) {
            toast.error(`Minimum investment is ₦${investment.minimumInvestment.toLocaleString()}`);
            return;
        }

        if (investmentAmount > userBalance) {
            toast.error("You do not have sufficient funds for this investment.");
            return;
        }

        if (numberOfDays < investment.minWithdrawalDays) {
            toast.error(`The minimum Investment period is ${investment.minWithdrawalDays} days`);
            return;
        }
        setIsInvesting(true);

        try {
            // Update user balance in Firestore (subtract the invested amount)
            const user = JSON.parse(localStorage.getItem("user"));
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            await updateDoc(userRef, {
                availableBalance: userBalance - Number(investmentAmount),
                investmentBalance: Number(investmentBalance || 0) + Number(investmentAmount),
            });

            // Log the investment in Firestore (save the investment record)
            const userInvestmentsRef = collection(db, "users", user.uid, "investments");
            await addDoc(userInvestmentsRef, {
                status: "Active",
                expectedReturn: calculatedProfit,
                uid: user.uid,
                productName: investment.productName,
                investmentAmount: Number(investmentAmount),
                investmentPeriod: Number(numberOfDays),
                expectedROI: Number(investment.expectedROI * numberOfDays),
                endDate: new Date(new Date().getTime() + numberOfDays * 24 * 60 * 60 * 1000).toISOString(),
                earningsSoFar: 0,
                createdAt: new Date().toISOString(),
            });

            const investmentRef = collection(db, "quickInvestments", "fastVegetables", "investors");
            await addDoc(investmentRef, {
                status: "Active",
                expectedReturn: calculatedProfit,
                uid: user.uid,
                productName: investment.productName,
                investmentAmount: Number(investmentAmount),
                investmentPeriod: Number(numberOfDays),
                expectedROI: Number(investment.expectedROI * numberOfDays),
                endDate: new Date(new Date().getTime() + numberOfDays * 24 * 60 * 60 * 1000).toISOString(),
                earningsSoFar: 0,
                createdAt: new Date().toISOString(),
            });

            await addDoc(collection(db, "transactions"), {
                userId: user.uid,
                email: user.email,
                amount: Number(investmentAmount),
                status: "successful",
                type: "Invest",
                investmentId: investment?.productName,
                timestamp: new Date().toISOString(),
            });

            toast.success(`Successfully invested ₦${Number(investmentAmount).toLocaleString()} in ${investment.productName}!`);
            navigate("/dashboard");
        } catch (error) {
            console.error("Error making investment:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsInvesting(false);
        }
    };
    return (
        <div className="bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-white min-h-screen flex flex-col items-center pt-6 px-4 pb-20">
            <ToastContainer position="top-right" autoClose={2300} />

            <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-lg z-10 relative">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{investment?.productName}</h2>

                {/* Investment Details */}
                <div className="mb-8 text-sm text-gray-700">
                    <p><strong>Expected ROI:</strong> {investment?.expectedROI}% {investment?.ROIFrequency}</p>
                    <p><strong>Minimum Investment Period:</strong> {investment?.minimumInvestmentPeriod} days</p>
                    {/* <p><strong>Minimum Withdrawal:</strong> {investment?.minWithdrawalDays} days</p> */}
                    <p><strong>Min Investment:</strong> ₦{investment?.minimumInvestment.toLocaleString()}</p>
                    <p><strong>Status:</strong> {investment?.status === "open" ? "Available" : "Closed"}</p>
                </div>

                {/* Investment Amount and Days */}
                <div className="mb-6">
                    <label htmlFor="investmentAmount" className="block text-gray-700 font-medium mb-2">
                        Enter Investment Amount (₦)
                    </label>
                    <input
                        id="investmentAmount"
                        type="number"
                        value={investmentAmount}
                        onChange={handleInvestmentChange}
                        className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0FA280] transition"
                        placeholder="Enter amount"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="investmentDays" className="block text-gray-700 font-medium mb-2">
                        Investment Duration (Days)
                    </label>
                    <input
                        id="investmentDays"
                        type="number"
                        value={numberOfDays}
                        onChange={handleDaysChange}
                        className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0FA280] transition"
                        placeholder="Enter number of days"
                    />
                </div>

                {/* Profit Calculation */}
                <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Investment Profit</h3>
                    <p className="text-sm text-gray-700 mt-2">Expected Profit for {numberOfDays} days:</p>
                    <div className="text-2xl font-semibold text-[#0FA280] mt-2">
                        ₦{calculatedProfit.toFixed(2)}
                    </div>
                </div>

                {/* Available Balance */}
                <div className="flex justify-between items-center mb-4">
                    <p className="font-medium">Available Balance:</p>
                    <p>₦{userBalance.toLocaleString()}</p>
                </div>

                {/* Invest Button */}
                <button
                    onClick={handleInvestNow}
                    disabled={isInvesting || investment?.status !== "open"}
                    className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition ${isInvesting || investment?.status !== "open"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#0FA280] hover:bg-[#0d8b6d]"
                        }`}
                >
                    {isInvesting ? "Investing..." : "Invest Now"}
                </button>
            </div>
        </div>
    );
};

export default InvestProductPage;
