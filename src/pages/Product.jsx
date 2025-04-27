import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, collection, setDoc, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion } from "framer-motion";
import { ArrowLeft, LoaderIcon } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const Product = () => {
    const [user, setUser] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product;
    const [loading, setLoading] = useState(false);
    const [investmentUnits, setInvestmentUnits] = useState(1); // Set default to 1 unit

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'User',
                    photoURL: currentUser.photoURL,
                });
                console.log(product);

            } else {
                navigate('/sign-in');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleInvest = async () => {
        setLoading(true);

        try {
            // Get product details from Firestore
            const productRef = doc(db, "investmentProducts", product.id);
            const productSnap = await getDoc(productRef);

            if (!productSnap.exists()) {
                throw new Error("Product not found");
            }

            const productData = productSnap.data();
            const availableUnits = productData.availableUnits;

            // Check if there are enough available units
            if (availableUnits < investmentUnits) {
                toast.error(`${product.availableUnits} units available. You can only invest up to ${product.availableUnits} units.`);
                setLoading(false);
                return;
            }

            const investmentAmount = Number(product.unitPrice * investmentUnits);
            if (investmentAmount < product.minimumInvestment) {
                toast.error(`Minimum investment unit is ${Math.ceil(product.minimumInvestment / product.unitPrice)}`);
                setLoading(false);
                return;
            }

            // Update available units in Firestore
            await updateDoc(productRef, {
                availableUnits: availableUnits - investmentUnits,
            });

            // Track the user's investment in Firestore (create a new entry instead of overwriting)
            const userInvestmentRef = collection(db, "users", user.uid, "investments");
            const investmentRef = collection(db, "investmentProducts", product.id, "investors");

            await addDoc(userInvestmentRef, {
                uid: user.uid,
                productName: product.name,
                investmentAmount: investmentAmount,
                investmentPeriod: product.investmentPeriod,
                expectedROI: product.expectedROI,
                status: "Pending",
                unitPrice: product.unitPrice,
                unitsBought: investmentUnits,
                startDate: product.startDate,
                endDate: new Date(new Date().getTime() + product.investmentPeriod * 24 * 60 * 60 * 1000).toISOString(),
                earningsSoFar: 0,
                createdAt: new Date().toISOString(),
            });

            await addDoc(investmentRef, {
                uid: user.uid,
                productName: product.name,
                investmentAmount: investmentAmount,
                investmentPeriod: product.investmentPeriod,
                expectedROI: product.expectedROI,
                status: "Pending",
                unitPrice: product.unitPrice,
                unitsBought: investmentUnits,
                startDate: product.startDate,
                endDate: new Date(new Date().getTime() + product.investmentPeriod * 24 * 60 * 60 * 1000).toISOString(),
                earningsSoFar: 0,
                createdAt: new Date().toISOString(),
            });

            // Add transaction record
            await addDoc(collection(db, "transactions"), {
                userId: user.uid,
                email: user.email,
                amount: investmentAmount,
                status: "successful",
                type: "Invest",
                investmentId: product.name,
                timestamp: new Date().toISOString(),
            });

            // Fetch current user data
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            // Update user balance
            await updateDoc(userRef, {
                availableBalance: Number(userData.availableBalance) - investmentAmount,
                investmentBalance: Number(userData.investmentBalance || 0) + investmentAmount,
            });

            toast.success("Investment successful 🎉");
            setTimeout(() => {
                navigate("/invest"); // Navigate back to the dashboard
            }, 2000);
        } catch (error) {
            console.error("Error making investment:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">Product not found.</p>
                <button onClick={() => navigate("/dashboard")} className="text-[#0FA280] mt-2">
                    <ArrowLeft /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? ' from-gray-800 to-gray-900' : ' from-[#0FA280] to-[#054D3B]'} p-6 pb-20`}>
            <div className={`max-w-3xl mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-xl p-6 z-50 relative`}>
                <motion.h1
                    className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#12B28C]' : 'text-[#0FA280]'}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {product.name}
                </motion.h1>

                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>{product.description}</p>

                <div className={`mt-4 grid grid-cols-2 gap-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Investment Period</p>
                        <p className="font-bold">{product.investmentPeriod} months</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Expected ROI</p>
                        <p className="font-bold">{product.expectedROI}%</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Minimum Investment</p>
                        <p className="font-bold">NGN {product.minimumInvestment.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Price per unit</p>
                        <p className="font-bold">NGN {product.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Available Units</p>
                        <p className="font-bold">{product.availableUnits.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Risk Level</p>
                        <p className="font-bold">{product.riskLevel}</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">Start Date</p>
                        <p className="font-bold">{new Date(product.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className={`p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                        <p className="text-xs">End Date</p>
                        <p className="font-bold">{new Date(product.endDate).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Investment Form */}
                <div className="mt-6">
                    <label htmlFor="units" className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Enter the number of units you want to buy:</label>
                    <input
                        type="number"
                        id="units"
                        value={investmentUnits}
                        min="1"
                        max={product.availableUnits}
                        onChange={(e) => setInvestmentUnits(Number(e.target.value))}
                        className={`w-full p-3 px-6 mt-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0FA280] transition-all`}
                        disabled={loading}
                    />
                </div>

                {/* ROI Calculator */}
                <div className={`mt-8 p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                    <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Return on Investment Calculator</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Investment Amount</p>
                            <p className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>NGN {(investmentUnits * product.unitPrice).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Expected ROI</p>
                            <p className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{product.expectedROI}% for {product.investmentPeriod} months</p>
                        </div>
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Expected Monthly Return</p>
                            <p className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>NGN {((investmentUnits * product.unitPrice * (product.expectedROI / 100)) / product.investmentPeriod).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Expected Total Return Amount</p>
                            <p className={`font-bold text-lg ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>NGN {((investmentUnits * product.unitPrice) + (investmentUnits * product.unitPrice * (product.expectedROI / 100))).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className={`${theme === 'dark' ? 'text-[#12B28C]' : 'text-[#0FA280]'} flex items-center gap-1 hover:underline cursor-pointer`}
                        disabled={loading}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <p>Back to Dashboard</p>
                    </button>
                    <button
                        onClick={handleInvest}
                        className={`${theme === 'dark' ? 'bg-[#12B28C] hover:bg-[#0F9A7A]' : 'bg-[#0FA280] hover:bg-[#0D8A6E]'} text-white px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2`}
                        disabled={loading}
                    >
                        {loading && <LoaderIcon className="animate-spin w-4 h-4" />}
                        Invest Now
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Product;
