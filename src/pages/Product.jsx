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
                toast.error(`Minimum investment unit is ${product.minimumInvestment / product.unitPrice}`);
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
                unitsInvested: investmentUnits,
                investmentAmount: investmentAmount,
                investmentDate: new Date().toISOString(),
            });

            await addDoc(investmentRef, {
                uid: user.uid,
                productName: product.name,
                unitsInvested: investmentUnits,
                investmentAmount: investmentAmount,
                investmentDate: new Date().toISOString(),
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
                balance: Number(userData.balance) - investmentAmount,
            });

            toast.success("Investment successful 🎉");
            setTimeout(() => {
                navigate("/dashboard"); // Navigate back to the dashboard
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
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
                <motion.h1
                    className="text-2xl font-bold text-[#0FA280]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {product.name}
                </motion.h1>

                <p className="text-gray-500 text-sm mt-2">{product.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4 text-gray-900">
                    <div className="p-4 bg-gray-200 rounded-lg">
                        <p className="text-xs">Investment Period</p>
                        <p className="font-bold">{product.investmentPeriod} months</p>
                    </div>
                    <div className="p-4 bg-gray-200 rounded-lg">
                        <p className="text-xs">Expected ROI</p>
                        <p className="font-bold">{product.expectedROI}%</p>
                    </div>
                    <div className="p-4 bg-gray-200 rounded-lg">
                        <p className="text-xs">Minimum Investment</p>
                        <p className="font-bold">NGN {product.minimumInvestment.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-200 rounded-lg">
                        <p className="text-xs">Price per unit</p>
                        <p className="font-bold">NGN {product.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-200 rounded-lg">
                        <p className="text-xs">Available Units</p>
                        <p className="font-bold">{product.availableUnits.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-200 rounded-lg">
                        <p className="text-xs">Risk Level</p>
                        <p className="font-bold">{product.riskLevel}</p>
                    </div>
                </div>

                {/* Investment Form */}
                <div className="mt-6">
                    <label htmlFor="units" className="text-gray-700">Enter the number of units you want to buy:</label>
                    <input
                        type="number"
                        id="units"
                        value={investmentUnits}
                        min="1"
                        max={product.availableUnits}
                        onChange={(e) => setInvestmentUnits(Number(e.target.value))}
                        className="w-full p-3 px-6 mt-2 bg-gray-100 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0FA280] transition-all"
                        disabled={loading}
                    />
                </div>

                {/* ROI Calculator */}
                <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Return on Investment Calculator</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Investment Amount</p>
                            <p className="font-bold text-lg">NGN {(investmentUnits * product.unitPrice).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Expected ROI</p>
                            <p className="font-bold text-lg">{product.expectedROI}% for {product.investmentPeriod} months</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Expected Monthly Return</p>
                            <p className="font-bold text-lg">NGN {((investmentUnits * product.unitPrice * (product.expectedROI / 100)) / product.investmentPeriod).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Expected Total Return Amount</p>
                            <p className="font-bold text-lg">NGN {((investmentUnits * product.unitPrice) + (investmentUnits * product.unitPrice * (product.expectedROI / 100))).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-[#0FA280] flex items-center gap-1 hover:underline cursor-pointer"
                        disabled={loading}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <p>Back to Dashboard</p>
                    </button>
                    <button
                        onClick={handleInvest} className="bg-[#0FA280] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#0D8A6E] transition-all flex items-center gap-2"
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
