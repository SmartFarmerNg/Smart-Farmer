import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const DepositSuccess = () => {
    const [searchParams] = useSearchParams();
    const paymentReference = searchParams.get("paymentReference");
    const [status, setStatus] = useState("verifying");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const res = await fetch(`https://smart-farmer-ercaspay-api.onrender.com/api/ercaspay/verify-payment?paymentReference=${paymentReference}`);
                const data = await res.json();

                if (data.success) {
                    // ✅ Update user's balance in Firestore
                    const uid = data.metadata.userId;
                    const amount = parseFloat(data.amount || 0);

                    const userRef = doc(db, "users", uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const prevBalance = userSnap.data().availableBalance || 0;
                        await updateDoc(userRef, {
                            availableBalance: prevBalance + amount,
                        });
                        setStatus("success");
                    } else {
                        setStatus("user-not-found");
                    }
                } else {
                    setStatus("failed");
                }

            } catch (err) {
                console.error("Verification error:", err);
                setStatus("error");
            }
        };

        if (paymentReference) {
            verifyPayment();
        } else {
            setStatus("invalid");
        }
    }, [paymentReference]);

    const renderContent = () => {
        switch (status) {
            case "verifying":
                return <p>Verifying your payment...</p>;
            case "success":
                return (
                    <>
                        <h2 className="text-2xl font-bold text-green-600">Deposit Successful 🎉</h2>
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md text-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default DepositSuccess;
