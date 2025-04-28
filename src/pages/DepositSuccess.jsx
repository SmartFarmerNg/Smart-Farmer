import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const DepositSuccess = () => {
    const navigate = useNavigate();

    const ERCASPAY_SECRET_KEY = import.meta.env.VITE_ERCAS_PAY_SECRET_KEY;


    useEffect(() => {
        let unsubscribeAuth;

        const verifyPayment = async (user) => {
            const urlParams = new URLSearchParams(window.location.search);
            const reference = urlParams.get("reference");

            if (!reference) {
                navigate("/dashboard");
                return;
            }

            try {
                const response = await fetch(`https://api.ercaspay.com/v1/verify/${reference}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${ERCASPAY_SECRET_KEY}`
                    },
                });

                const data = await response.json();

                if (data.status === "success" && data.data.status === "successful") {
                    const amountPaid = data.data.amount;
                    const transactionId = data.data.id;

                    // Update user's balance
                    const userRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const prevBalance = userDoc.data().availableBalance || 0;
                        const newBalance = prevBalance + amountPaid;

                        await updateDoc(userRef, {
                            availableBalance: newBalance,
                        });
                    }

                    // Save transaction to Firestore
                    const transactionRef = collection(db, "transactions");
                    await addDoc(transactionRef, {
                        uid: user.uid,
                        email: user.email,
                        type: "deposit",
                        amount: amountPaid,
                        reference: reference,
                        transactionId: transactionId,
                        status: "success",
                        createdAt: new Date(),
                    });

                    // Done! Show success and redirect
                    alert("Deposit successful!");
                    navigate("/invest");
                } else {
                    alert("Payment verification failed.");
                    navigate("/deposit");
                }
            } catch (error) {
                console.error(error);
                alert("Error verifying payment.");
                navigate("/deposit");
            }
        };

        unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                verifyPayment(currentUser);
            } else {
                navigate("/sign-in");
            }
        });

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
        };
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <p className="text-xl font-semibold">Verifying your payment, please wait...</p>
        </div>
    );
};

export default DepositSuccess;
