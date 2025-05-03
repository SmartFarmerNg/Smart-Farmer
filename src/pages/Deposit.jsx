import { AlertTriangle, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
    doc,
    getDoc,
    collection,
    addDoc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [balance, setBalance] = useState(0);
    const [minimumDeposit] = useState(100);
    const [isProcessing, setIsProcessing] = useState(false);

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";

    const BASE_URL = "https://smart-farmer-ercaspay-api.onrender.com";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({ uid: currentUser.uid, email: currentUser.email });
                setEmail(currentUser.email);

                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setBalance(data.availableBalance || 0);
                        setFullName(
                            `${data.lastName || ""} ${data.firstName || ""}`.trim()
                        );
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    toast.error("Unable to load user information.");
                }
            } else {
                navigate("/sign-in");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleErcaspayDeposit = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < minimumDeposit) {
            toast.warning(`Please enter at least ₦${minimumDeposit}`);
            setIsProcessing(false);
            return;
        }

        const paymentReference = user.uid + Date.now();

        const depositData = {
            amount: parsedAmount,
            paymentReference,
            paymentMethods: "card,bank-transfer,ussd,qrcode",
            customerName: fullName,
            customerEmail: email,
            currency: "NGN",
            redirectUrl: window.location.origin + "/transact/deposit-success",
            description: "Deposit to your account",
            metadata: {
                userId: user.uid,
                userEmail: email,
                userName: fullName,
            },
        };

        try {
            const response = await fetch(`${BASE_URL}/api/ercaspay/initiate-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(depositData),
            });

            const text = await response.text();

            if (response.ok) {
                const data = JSON.parse(text);
                if (data.responseMessage === "success") {
                    await addDoc(collection(db, "transactions"), {
                        uid: user.uid,
                        email: user.email,
                        type: "deposit",
                        amount: parsedAmount,
                        status: "pending",
                        reference: paymentReference,
                        txn_data: depositData,
                        createdAt: new Date().toISOString()
                    });

                    window.location.href = data.responseBody.checkoutUrl;
                } else {
                    toast.error("Payment initiation failed.");
                }
            } else {
                toast.error("Unable to initiate payment.");
            }
        } catch (err) {
            console.error("Payment error:", err);
            toast.error("An error occurred during deposit.");
        }

        setIsProcessing(false);
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(value);

    const isDisabled =
        !amount || parseFloat(amount) < minimumDeposit || isProcessing;

    return (
        <div
            className={`min-h-screen text-white font-sans flex items-center justify-center p-4 ${theme === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-900"
                : "bg-gradient-to-br from-[#0FA280] to-[#054D3B]"
                }`}
        >
            <ToastContainer position="top-right" autoClose={2300} />
            <div
                className={`${theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-800"
                    } backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 z-50`}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full ${theme === "dark"
                            ? "bg-white/20 hover:bg-white/30"
                            : "bg-black/20 hover:bg-black/30"
                            }`}
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-2xl font-bold mx-auto">Make a Deposit</h1>
                </div>

                {loading ? (
                    <p className="text-center text-sm">Loading user info...</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        <p className='text-red-600 font-semibold flex gap-2 items-center mb-2 text-sm'> <AlertTriangle size={20} /><span>(Deposits is still in development. Funds may be lost.)</span></p>

                        <p>
                            Available Balance:{" "}
                            <span className="font-semibold">{formatCurrency(balance)}</span>
                        </p>
                        <p>
                            Minimum Deposit:{" "}
                            <span className="font-semibold">
                                {formatCurrency(minimumDeposit)}
                            </span>
                        </p>

                        <div>
                            <label className="text-sm font-semibold">Full Name</label>
                            <input
                                type="text"
                                placeholder={fullName}
                                disabled
                                className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === "dark"
                                    ? "bg-white/10 border-white/30"
                                    : "bg-black/10 border-black/30"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <input
                                type="email"
                                placeholder={email}
                                disabled
                                className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === "dark"
                                    ? "bg-white/10 border-white/30"
                                    : "bg-black/10 border-black/30"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Amount (₦)</label>
                            <input
                                type="number"
                                min={minimumDeposit}
                                value={amount}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*\.?\d*$/.test(val)) setAmount(val);
                                }}
                                className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === "dark"
                                    ? "bg-white/10 border-white/30"
                                    : "bg-black/10 border-black/30"
                                    }`}
                            />
                            {amount && parseFloat(amount) >= minimumDeposit && (
                                <p className="text-xs text-gray-400 mt-2">
                                    You’ll be redirected to complete a deposit of{" "}
                                    <strong>{formatCurrency(parseFloat(amount))}</strong>
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleErcaspayDeposit}
                            disabled={isDisabled}
                            className={`w-full text-center py-3 rounded-xl font-semibold transition ${isDisabled
                                ? `${theme === "dark"
                                    ? "bg-white/30"
                                    : "bg-black/30"
                                } cursor-not-allowed`
                                : theme === "dark"
                                    ? "bg-white text-black hover:bg-gray-300"
                                    : "bg-black text-white hover:bg-gray-900"
                                }`}
                        >
                            {isProcessing
                                ? "Processing...Please wait."
                                : `Deposit ${amount
                                    ? `₦${amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                                    : ""
                                }`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deposit;
