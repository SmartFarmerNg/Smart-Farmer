import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { motion } from "framer-motion";

const Deposit = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                });
            } else {
                navigate("/sign-in");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="w-full min-h-screen max-w-lg bg-white/30 backdrop-blur-xl shadow-lg p-6 font-sans">
            <header className="flex items-center mb-6">
                <button onClick={() => navigate("/profile")} className="cursor-pointer">
                    <ArrowLeft className="text-gray-800 w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-[#0FA280] mx-auto">Deposit</h1>
            </header>

            <div className="flex flex-col gap-5">
                {[
                    { method: "Deposit via Paystack", delay: 0.1 },
                    { method: "Deposit via Bank Transfer", delay: 0.2 },
                ].map((item, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: item.delay,
                            ease: [0, 0.71, 0.2, 1.01],
                        }}
                        className="flex justify-between items-center bg-white/50 backdrop-blur-lg border-2 border-[#0FA280] shadow-md rounded-xl p-4 transition-all hover:bg-[#0FA280] hover:text-white cursor-pointer"
                    >
                        <h1 className="font-bold">{item.method}</h1>
                        <ArrowRight className="w-6 h-6" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Deposit;
