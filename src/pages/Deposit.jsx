import { ArrowLeft, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { PaystackButton } from "react-paystack";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [balance, setBalance] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";

    const publicKey = "pk_test_1a3a0ace0098f205c173a84c35960a794793ff87";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({ uid: currentUser.uid, email: currentUser.email });
                setEmail(currentUser.email);

                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setBalance(userDoc.data().availableBalance || 0);
                }
            } else {
                navigate("/sign-in");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSuccess = async (reference) => {
        if (isProcessing) return;
        setIsProcessing(true);
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) return;

        const newBalance = balance + depositAmount;
        const userRef = doc(db, "users", user.uid);

        try {
            await addDoc(collection(db, "transactions"), {
                userId: user.uid,
                email: user.email,
                amount: depositAmount,
                status: "successful",
                type: "Deposit",
                transactionId: reference.reference,
                timestamp: new Date().toISOString(),
            });

            await setDoc(userRef, { availableBalance: newBalance }, { merge: true });

            setBalance(newBalance);
            setTransactionId(reference.reference);
            setShowSuccess(true);
        } catch (error) {
            console.error("Transaction failed", error);
            setShowSuccess(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const paystackConfig = {
        email,
        amount: parseFloat(amount || 0) * 100,
        publicKey,
        currency: "NGN",
        channels: ["card", "bank", "ussd"],
        onSuccess: handleSuccess,
        onClose: () => alert("Payment window closed."),
    };

    const isDisabled = !amount || parseFloat(amount) <= 0 || isProcessing;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(value);
    };

    return (
        <div className={`min-h-screen text-white font-sans flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0FA280] to-[#054D3B]'}`}>
            {showSuccess ? (
                <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'} backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in z-50`}>
                    <CheckCircle2 className="text-green-400 w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Deposit Successful</h2>
                    <p className="text-lg">Balance: <span className="font-semibold">{formatCurrency(balance)}</span></p>
                    <p className="text-sm mt-1">Transaction ID: <span className="font-mono">{transactionId}</span></p>
                    <button
                        className={`mt-6 px-6 py-3 rounded-xl font-semibold transition ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-300' : 'bg-black text-white hover:bg-gray-900'}`}
                        onClick={() => navigate("/invest")}
                    >
                        Start Investing 🚀
                    </button>
                </div>
            ) : (
                <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'} backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 animate-fade-in z-50`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-black/20 hover:bg-black/30'}`}
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                        <h1 className="text-2xl font-bold mx-auto">Make a Deposit</h1>
                    </div>

                    <div>
                        <p className="text-base">
                            Available Balance: <span className="font-semibold">{formatCurrency(balance)}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[accent] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold">Amount (₦)</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                                placeholder="Enter amount"
                                className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[accent] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
                            />
                        </div>

                        <PaystackButton
                            {...paystackConfig}
                            disabled={isDisabled}
                            className={`w-full text-center py-3 rounded-xl font-semibold transition ${isDisabled
                                ? `${theme === 'dark' ? 'bg-white/30' : 'bg-black/30'} cursor-not-allowed`
                                : theme === 'dark' ? 'bg-white text-black hover:bg-gray-300' : 'bg-black text-white hover:bg-gray-900'
                                }`}
                        >
                            {isProcessing ? "Processing..." : `Deposit ${amount ? `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : ""}`}
                        </PaystackButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deposit;
