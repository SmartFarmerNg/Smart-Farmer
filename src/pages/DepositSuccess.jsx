import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
                console.log("Verification result:", data);

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
                        console.log("Transaction already completed.");
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
                        verifiedAt: new Date(),
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
                return <p>Verifying your payment...</p>;
            case "success":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-green-600">
                            Deposit of {formatCurrency(amount)} Successful 🎉
                        </h2>
                        <p className="text-lg">Your new balance is {formatCurrency(newBalance)}</p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md"
                        >
                            Go to Dashboard
                        </button>
                    </>
                );
            case "failed":
                return <p className="text-red-500">Payment not successful.</p>;
            case "user-not-found":
                return <p>User not found. Contact support.</p>;
            case "invalid":
                return <p>Invalid payment reference.</p>;
            case "error":
            default:
                return <p>Something went wrong. Please try again later.</p>;
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
