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

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";


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
                    setBankCode(userDoc.data().bankCode || "");
                    setAccountNumber(userDoc.data().bankAccount || "");
                }
            } else {
                navigate("/sign-in");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    // Replace with actual list or fetch dynamically from Paystack
    const [banks, setBanks] = useState([]);

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await fetch('https://api.paystack.co/bank');
                const data = await response.json();
                if (data.status) {
                    setBanks(data.data.map(bank => ({
                        name: bank.name,
                        code: bank.code
                    })));
                }
            } catch (error) {
                console.error('Error fetching banks:', error);
                toast.error('Failed to load banks');
            }
        };

        fetchBanks();
    }, []);
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
        <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-[#0FA280] to-[#054D3B]'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} min-h-screen flex flex-col justify-center items-center p-6`}>
            <div className={`w-full max-w-lg px-6 py-10 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'} backdrop-blur-md rounded-lg shadow-lg z-50`}>
                <header className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className={`cursor-pointer p-2 ${theme === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'} rounded-full`}>
                        <ArrowLeft className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} w-6 h-6`} />
                    </button>
                    <h1 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mx-auto`}>Make a Withdrawal</h1>
                </header>

                <p className='text-red-600 font-semibold flex gap-2 items-center mb-2'> <AlertTriangle size={20} /><span>(Withdrawals are unavailable at the moment)</span></p>

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account Number"
                        className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-white/20 text-white placeholder-white' : 'bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[${accent}]`}
                    />

                    <select
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-500 text-white placeholder-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-[${accent}]`}
                    >
                        <option value="">Select Bank</option>
                        {banks.map((bank) => (
                            <option key={bank.name} value={bank.code}>
                                {bank.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleVerify}
                        disabled={true}
                        className='text-white font-semibold p-3 rounded-xl transition flex items-center justify-center gap-2'
                        style={{ backgroundColor: accent }}
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
                        className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-white/20 text-white placeholder-white' : 'bg-white text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-[${accent}]`}
                    />

                    <button
                        onClick={handleWithdraw}
                        className='font-semibold p-3 rounded-xl transition text-white'
                        style={{ backgroundColor: accent }}
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
