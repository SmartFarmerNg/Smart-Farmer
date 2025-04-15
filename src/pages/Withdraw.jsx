import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../firebase"; // Add this if not already imported
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Withdraw = () => {
    const navigate = useNavigate();
    const [accountNumber, setAccountNumber] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [accountName, setAccountName] = useState("");
    const [amount, setAmount] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [balance, setBalance] = useState(0);
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(null);


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

    // Replace with actual list or fetch dynamically from Paystack
    const banks = [
        { name: "Access Bank", code: "044" },
        { name: "GTBank", code: "058" },
        { name: "UBA", code: "033" },
        { name: "First Bank", code: "011" },
        { name: "Zenith Bank", code: "057" },
    ];

    const handleVerify = async () => {
        if (!accountNumber || !bankCode) {
            toast.error("Enter account number and select bank.");
            return;
        }

        setVerifying(true);

        try {
            const verifyBankAccount = httpsCallable(functions, "verifyBankAccount");
            const res = await verifyBankAccount({ accountNumber, bankCode });

            if (res?.data?.status && res.data.data.account_name) {
                setAccountName(res.data.data.account_name);
                setVerified(true);
                toast.success("Account verified successfully!");
            } else {
                toast.error("Verification failed.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            toast.error("Error verifying account.");
        } finally {
            setVerifying(false);
        }
    };


    const handleWithdraw = async () => {
        if (!verified) {
            toast.error("Please verify account first.");
            return;
        }

        const withdrawAmount = Number(amount);
        if (withdrawAmount <= 0) {
            toast.error("Enter valid amount.");
            return;
        }

        setProcessing(true);

        try {
            const initiateTransfer = httpsCallable(functions, "initiatePaystackTransfer");
            const res = await initiateTransfer({
                amount: withdrawAmount,
                bankCode,
                accountNumber,
                accountName,
                userId: user?.uid,
                email: user?.email,
            });

            if (res.data.status === "success") {
                // ✅ 1. Deduct balance in Firestore
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                const currentBalance = userSnap.data()?.availableBalance || 0;

                if (currentBalance < withdrawAmount) {
                    toast.error("Insufficient balance!");
                    return;
                }

                await updateDoc(userRef, {
                    availableBalance: currentBalance - withdrawAmount,
                });

                // ✅ 2. Save withdrawal transaction
                await addDoc(collection(db, "transactions"), {
                    userId: user.uid,
                    email: user.email,
                    amount: withdrawAmount,
                    status: "pending", // you can update this later if needed
                    type: "Withdraw",
                    method: "Paystack",
                    transferCode: res.data.transferCode,
                    accountNumber,
                    bankCode,
                    accountName,
                    timestamp: new Date().toISOString(),
                });

                toast.success("Withdrawal initiated and recorded.");
                setAmount(""); // Clear input
            }
        } catch (error) {
            console.error("Transfer Error:", error);
            toast.error("Transfer failed. Try again.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-950 to-blue-900 text-white min-h-screen flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-lg px-6 py-10 bg-white/20 backdrop-blur-md rounded-lg shadow-lg z-50">
                <header className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="cursor-pointer p-2 bg-white/20 rounded-full hover:bg-white/30">
                        <ArrowLeft className="text-white w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-white mx-auto">Withdraw via Paystack</h1>
                </header>

                <p className="text-amber-300 flex gap-2 items-center mb-2"> <AlertTriangle size={20} /> (Withdrawals are not unavailable at the moment)</p>

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        className="p-3 rounded-lg border bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <select
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="p-3 rounded-lg border bg-gray-500 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Bank</option>
                        {banks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                                {bank.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleVerify}
                        // disabled={verifying}
                        disabled={true}
                        className="bg-white text-black font-semibold p-3 rounded-xl transition hover:bg-gray-200 flex items-center justify-center gap-2"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" /> Verifying...
                            </>
                        ) : (
                            "Verify Account"
                        )}
                    </button>

                    {verified && (
                        <p className="text-sm text-green-400">
                            ✅ Account Name: <span className="font-semibold">{accountName}</span>
                        </p>
                    )}
                    <br />
                    <p>Available balance: NGN {balance.toLocaleString()}</p>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount to withdraw"
                        className="p-3 rounded-lg border bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={handleWithdraw}
                        className="bg-white text-black font-semibold p-3 rounded-xl hover:bg-gray-300 transition"
                        disabled={true}
                    >
                        Withdraw Now
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Withdraw;
