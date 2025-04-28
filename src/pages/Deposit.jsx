import { ArrowLeft, CheckCircle2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [balance, setBalance] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const accent = localStorage.getItem("accent") || "#0FA280";
    const theme = localStorage.getItem("theme") || "light";

    const ERCASPAY_SECRET_KEY = import.meta.env.VITE_ERCAS_PAY_SECRET_KEY;
    // const ERCASPAY_API_KEY = import.meta.env.VITE_ERCASPAY_API_KEY;
    // console.log(ERCASPAY_SECRET_KEY);


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

        try {
            const depositData = {
                amount: parseFloat(amount),
                paymentReference: user.uid + Date.now(),
                paymentMethods: "card,bank-transfer,ussd,qrcode",
                customerName: fullName,
                customerEmail: email,
                currency: "NGN",
                callback_url: window.location.origin + "/transact/deposit-success",
            };

            console.log("Deposit data to send:", depositData);

            const response = await fetch("https://api-staging.ercaspay.com/api/v1/payment/initiate", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ERCASPAY_SECRET_KEY}`,
                },
                body: JSON.stringify(depositData),
                redirect: 'follow'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            console.log("Response from ERCASPAY:", data);

            if (data.responseMessage === "success") {
                window.location.href = data.responseBody.checkoutUrl;
            } else {
                console.error("ERCASPAY Error", data.message);
                alert("Payment initialization failed: " + data.message);
            }
        } catch (error) {
            console.error("Error initializing payment", error);
            alert("Error initializing payment");
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
                            className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
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
                            className={`w-full mt-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[${accent}] ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'}`}
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
