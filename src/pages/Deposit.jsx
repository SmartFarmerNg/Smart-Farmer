import { ArrowLeft, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [balance, setBalance] = useState(0);
    const [minimumDeposit, setMinimumDeposit] = useState(1000);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";

    const BASE_URL = 'https://smart-farmer-ercaspay-api.onrender.com';
    console.log(BASE_URL);



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser({ uid: currentUser.uid, email: currentUser.email });
                setEmail(currentUser.email);

                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setBalance(userDoc.data().availableBalance || 0);
                    setFullName(userDoc.data().lastName + ' ' + userDoc.data().firstName || "");
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
        if (!parsedAmount || parsedAmount < minimumDeposit) {
            toast.warning("Please enter a valid amount");
            setIsProcessing(false);
            return;
        }


        try {
            const depositData = {
                amount: parseFloat(amount),
                paymentReference: user.uid + Date.now(),
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
                }
            };

            const payload = {
                ...depositData,
                metadata: depositData.metadata || {},
            };


            console.log("Deposit data to send:", payload);

            const response = await fetch(`${BASE_URL}/api/ercaspay/initiate-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const text = await response.text();
            console.log("Raw response:", text);
            if (response.ok) {
                const data = JSON.parse(text);
                console.log("Response from ERCASPAY:", data);
                if (data.responseMessage === "success") {
                    setTransactionId(data.responseBody.paymentReference);
                    setShowSuccess(true);
                    await addDoc(collection(db, "transactions"), {
                        uid: user.uid,
                        email: user.email,
                        type: "deposit",
                        amount: parseFloat(amount),
                        status: "pending",
                        reference: depositData.paymentReference,
                        createdAt: new Date(),
                    });

                    window.location.href = data.responseBody.checkoutUrl;
                } else {
                    toast.error("Payment initiation failed");
                }
            } else {
                toast.error("Payment initiation failed");
            }
        } catch (error) {
            console.error("Error during payment initiation:", error);
            toast.error("Payment initiation failed");
        } finally {
            setIsProcessing(false);
        }
    };


    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(value);
    };

    const isDisabled = !amount || parseFloat(amount) <= 0 || isProcessing;

    return (
        <div className={`min-h-screen text-white font-sans flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0FA280] to-[#054D3B]'}`}>
            <ToastContainer position="top-right" autoClose={2300} />
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
                    <p className="text-base">
                        Minimum Deposit <span className="font-semibold">{formatCurrency(minimumDeposit)}</span>
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <div>
                        <label className="text-sm font-semibold">Full name</label>
                        <input
                            type="email"
                            placeholder={fullName}
                            disabled
                            className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            placeholder={email}
                            disabled
                            className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Amount (₦)</label>
                        <input
                            type="number"
                            min={minimumDeposit}
                            inputMode="numeric"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                            className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
                        />
                    </div>

                    <button
                        onClick={handleErcaspayDeposit}
                        disabled={isDisabled}
                        className={`w-full text-center py-3 rounded-xl font-semibold transition ${isDisabled
                            ? `${theme === 'dark' ? 'bg-white/30' : 'bg-black/30'} cursor-not-allowed`
                            : theme === 'dark' ? 'bg-white text-black hover:bg-gray-300' : 'bg-black text-white hover:bg-gray-900'
                            }`}
                    >
                        {isProcessing ? "Processing..." : `Deposit ${amount ? `₦${amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : ""}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Deposit;
