import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

const Withdraw = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [balance, setBalance] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({ uid: currentUser.uid, email: currentUser.email });

                // Fetch user balance
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setBalance(userDoc.data().balance || 0);
                }
            } else {
                navigate("/sign-in");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const withdrawAmount = Number(amount);

        if (withdrawAmount <= 0 || !withdrawAmount) {
            alert("Please enter a valid amount!");
            return;
        }

        if (withdrawAmount > balance) {
            alert("Insufficient balance!");
            return;
        }

        const newBalance = balance - withdrawAmount;
        const userRef = doc(db, "users", user.uid);

        // Update Firestore user balance
        await setDoc(userRef, { balance: newBalance }, { merge: true });

        // Add transaction record
        await addDoc(collection(db, "transactions"), {
            userId: user.uid,
            email: user.email,
            amount: withdrawAmount,
            status: "successful",
            type: "Withdraw",
            timestamp: new Date().toISOString(),
        });

        // Update local state
        setBalance(newBalance);
        setShowSuccess(true);
    };

    return (
        <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white font-sans min-h-screen flex flex-col justify-center items-center p-6">
            {showSuccess ? (
                <div className="w-full max-w-lg px-6 py-10 bg-white/20 backdrop-blur-md rounded-lg shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-white">🎉 Withdrawal Successful!</h1>
                    <p className="text-lg mt-2">Your new balance: <span className="font-semibold">NGN {balance}</span></p>
                    <button className="bg-white text-black font-semibold px-6 py-3 rounded-xl mt-4 hover:bg-gray-300 transition" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-lg px-6 py-10 bg-white/20 backdrop-blur-md rounded-lg shadow-lg">
                    <header className="flex items-center mb-6">
                        <button onClick={() => navigate(-1)} className="cursor-pointer p-2 bg-white/20 rounded-full hover:bg-white/30">
                            <ArrowLeft className="text-white w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-white mx-auto">Withdraw</h1>
                    </header>

                    <p className="text-lg text-white mb-4">Current Balance: <span className="font-semibold">NGN {balance}</span></p>

                    <form className="flex flex-col gap-5 text-white">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter withdrawal amount"
                            className="p-3 rounded-lg border bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={(e) => handleWithdraw(e)} type="button" className="bg-white text-black font-semibold p-3 rounded-xl hover:bg-gray-300 transition cursor-pointer">
                            Withdraw Now
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Withdraw;
