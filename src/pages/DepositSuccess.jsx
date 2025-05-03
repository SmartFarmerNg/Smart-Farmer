import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// import { Player } from "@lottiefiles/react-lottie-player"; // optional alternative
// import Lottie from "lottie-react";
// import successAnim from "../animations/success.json";


import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase";

const DepositSuccess = () => {
    const [searchParams] = useSearchParams();
    const [amount, setAmount] = useState(0);
    const [newBalance, setNewBalance] = useState(0);
    const transactionRef = searchParams.get("transRef");
    const reference = searchParams.get("reference");

    const [status, setStatus] = useState("verifying");
    const navigate = useNavigate();
    const BASE_URL = 'https://smart-farmer-ercaspay-api.onrender.com';

    useEffect(() => {
        const verifyPayment = async () => {
            if (!transactionRef || !reference) {
                setStatus("invalid");
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/api/ercaspay/verify-payment?transactionRef=${transactionRef}`);
                const data = await res.json();

                if (data.success && data.status === "SUCCESSFUL") {
                    let uid = null;
                    try {
                        const parsedMeta = typeof data.metadata === "string" ? JSON.parse(data.metadata) : data.metadata;
                        uid = parsedMeta?.userId;
                    } catch (parseError) {
                        console.error("Metadata parsing failed:", parseError);
                        setStatus("error");
                        return;
                    }

                    const parsedAmount = parseFloat(data.amount || 0);
                    if (!uid || isNaN(parsedAmount) || parsedAmount <= 0) {
                        setStatus("error");
                        return;
                    }

                    const userRef = doc(db, "users", uid);
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        setStatus("user-not-found");
                        return;
                    }

                    // Fetch transaction by reference
                    const q = query(collection(db, "transactions"), where("reference", "==", reference));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        console.warn("Transaction not found.");
                        setStatus("error");
                        return;
                    }

                    const transactionDoc = querySnapshot.docs[0];
                    const transactionRef = transactionDoc.ref;
                    const currentStatus = transactionDoc.data().status;

                    if (currentStatus === "successful") {
                        navigate("/dashboard");
                        return;
                    }

                    const prevBalance = userSnap.data().availableBalance || 0;
                    const updatedBalance = prevBalance + parsedAmount;

                    // Update user balance
                    await updateDoc(userRef, {
                        availableBalance: updatedBalance,
                    });
                    setNewBalance(updatedBalance);
                    setAmount(parsedAmount);

                    // Mark transaction as successful
                    await updateDoc(transactionRef, {
                        status: "successful",
                        verifiedAt: new Date().toISOString(),
                        transactionId: data.transactionReference || transactionRef,
                        paymentMethod: data.paymentMethod || "unknown",
                        rawResponse: data,
                    });

                    setStatus("success");
                } else {
                    setStatus("failed");
                }
            } catch (err) {
                console.error("Verification error:", err);
                setStatus("error");
            }
        };

        verifyPayment();
    }, [transactionRef, reference]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(value);
    };

    const renderContent = () => {
        switch (status) {
            case "verifying":
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-opacity-50"></div>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Verifying your payment...</p>
                    </div>
                );
            case "success":
                return (
                    <div className="relative overflow-hidden px-4">
                        <div className="relative z-10 backdrop-blur-xl bg-white/30 dark:bg-white/10 shadow-2xl rounded-2xl p-8 max-w-md mx-auto text-center space-y-6 border border-white/20">
                            <h2 className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">
                                Deposit Successful 🎉
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                You’ve deposited <span className="font-semibold">{formatCurrency(amount)}</span>
                            </p>
                            <p className="text-md text-gray-600 dark:text-gray-400">
                                Your new balance is <span className="font-semibold">{formatCurrency(newBalance)}</span>
                            </p>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full py-3 px-6 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition duration-300 shadow-md"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                );
            case "failed":
                return (
                    <div className="space-y-3">
                        <p className="text-xl font-semibold text-red-600">❌ Payment Failed</p>
                        <p className="text-gray-600 dark:text-gray-300">We couldn't verify your payment. Please try again.</p>
                    </div>
                );
            case "user-not-found":
                return (
                    <div className="space-y-3">
                        <p className="text-xl font-semibold text-yellow-600">⚠️ User Not Found</p>
                        <p className="text-gray-600 dark:text-gray-300">The user ID could not be found. Contact support.</p>
                    </div>
                );
            case "invalid":
                return (
                    <div className="space-y-3">
                        <p className="text-xl font-semibold text-red-500">Invalid Payment</p>
                        <p className="text-gray-600 dark:text-gray-300">Missing or invalid transaction reference.</p>
                    </div>
                );
            case "error":
            default:
                return (
                    <div className="space-y-3">
                        <p className="text-xl font-semibold text-red-600">🚫 Error</p>
                        <p className="text-gray-600 dark:text-gray-300">Something went wrong. Please try again later.</p>
                    </div>
                );
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center z-5">
                {renderContent()}
            </div>
        </div>
    );
};

export default DepositSuccess;
