import React, { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, ChevronLeftCircle, ChevronRightCircle, CircleDollarSign, Loader, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/component/Footer";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import TransactionList from "../components/component/TransactionList";

const Transact = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [accent, setAccent] = useState(localStorage.getItem("accent") || "#0FA280");

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchTransactions(currentUser.uid);
                const userDoc = doc(db, "users", currentUser.uid);
                onSnapshot(userDoc, (doc) => {
                    setBalance(doc.data().availableBalance);
                    setTheme(doc.data().theme);
                    setAccent(doc.data().accent);
                });
            } else {
                navigate("/sign-in");
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const fetchTransactions = (userId) => {
        const q = query(collection(db, "transactions"), where("userId", "==", userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let totalBalance = 0;
            const txnList = snapshot.docs.map(doc => {
                const data = doc.data();
                if (data.type === "Deposit") totalBalance += data.amount;
                if (data.type === "Withdraw") {
                    const withdrawalFee = data.amount * 0.05;
                    totalBalance -= (data.amount + withdrawalFee);
                }
                if (data.type === "Invest") totalBalance -= data.amount;
                return { id: doc.id, ...data };
            });

            setTransactions(txnList);
            setLoading(false);
        });

        return unsubscribe;
    };
    return (
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0FA280] to-[#054D3B]'} text-gray-900 font-sans overflow-scroll h-screen flex flex-col items-center pb-20`}>
            <div className='w-full max-w-3xl px-4 pt-6 z-50'>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`${theme === "dark" ? 'bg-gray-800' : 'bg-gray-200 border border-gray-300'} shadow-lg rounded-xl p-4 w-full text-center relative overflow-hidden`}
                >
                    <h2 className="text-sm font-semibold text-gray-600">Available Balance</h2>
                    <p className="text-xl font-bold text-[#0FA280]">NGN {balance.toLocaleString() || 0}</p>
                    <CircleDollarSign className='text-[#0fa280] w-16 h-16 opacity-20 rotate-12 scale-200 absolute right-12 top-5 select-none pointer-events-none' />
                    <Banknote className='text-[#0FA280] w-16 h-16 opacity-20 -rotate-12 scale-200 absolute left-12 top-5 select-none pointer-events-none' />
                </motion.div>

                {/* Quick Actions */}
                <div className="mt-4 w-full grid grid-cols-2 gap-4 z-50">
                    {["Deposit", "Withdraw"].map((action, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center p-3 rounded-lg shadow-md hover:shadow-xl transition ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}
                            onClick={() => navigate(`/transact/${action.toLowerCase()}`)}
                        >
                            {action === "Deposit" ? <ArrowDownLeft className="text-green-600 w-5 h-5" /> : <ArrowUpRight className="text-red-600 w-5 h-5" />}
                            <span className="text-sm font-semibold mt-2">{action}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Transaction History */}
                <TransactionList transactions={transactions} loading={loading} theme={theme} accent={accent} />
            </div>
        </div>
    );
};

export default Transact;
