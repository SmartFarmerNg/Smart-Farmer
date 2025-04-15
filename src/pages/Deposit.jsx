import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { PaystackButton } from "react-paystack";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [balance, setBalance] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [td, setTd] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const publicKey = "pk_test_1a3a0ace0098f205c173a84c35960a794793ff87";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                });
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
        console.log("Payment successful", reference);
        setShowSuccess(true);

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

            setTd(reference.reference);


            await setDoc(userRef, { availableBalance: newBalance }, { merge: true });
            setBalance(newBalance);
        } catch (error) {
            console.error("Transaction failed", error);
            setShowSuccess(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const paystackConfig = {
        email,
        amount: amount * 100,
        publicKey,
        currency: "NGN",
        channels: ["card", "bank", "ussd"],
        onSuccess: handleSuccess,
        onClose: () => alert("Payment window closed."),
    };

    return (
        <div className="bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-white font-sans min-h-screen flex flex-col justify-center items-center p-6">
            {showSuccess ? (
                <div className="w-full max-w-lg px-6 py-10 bg-white/20 backdrop-blur-md rounded-lg shadow-lg text-center z-50">
                    <h1 className="text-2xl font-bold text-white">🎉 Deposit Successful!</h1>
                    <p className="text-lg mt-2">Your new balance: <span className="font-semibold">NGN {balance.toLocaleString()}</span></p>
                    <p className="text-lg mt-2">Your Transaction ID: <span className="font-semibold">{td}</span></p>
                    <button className="bg-white text-black font-semibold px-6 py-3 rounded-xl mt-4 hover:bg-gray-300 transition cursor-pointer" onClick={() => navigate("/invest")}>Start Investing Now!🚀</button>
                </div>
            ) : (
                <div className="w-full max-w-lg px-6 py-10 bg-white/20 backdrop-blur-md rounded-lg shadow-lg z-50">
                    <header className="flex items-center mb-6">
                        <button onClick={() => navigate(-1)} className="cursor-pointer p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="text-white w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-white mx-auto">Deposit</h1>
                    </header>

                    <p className="text-lg text-white mb-4">Current Balance: <span className="font-semibold">NGN {balance.toLocaleString()}</span></p>

                    <div className="flex flex-col gap-5 text-white">
                        <input type="email" value={email} disabled className="p-3 rounded-lg border bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#0FA280]" />
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Enter deposit amount" className="p-3 rounded-lg border bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#0FA280]" />
                        <PaystackButton
                            {...paystackConfig}
                            className={`bg-white text-black font-semibold p-3 rounded-xl hover:bg-gray-300 transition cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Deposit Now'}
                        </PaystackButton>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deposit;
