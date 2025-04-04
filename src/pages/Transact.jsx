import React, { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, ChevronLeftCircle, ChevronRightCircle, CircleDollarSign, Loader, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/component/Footer";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const Transact = () => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 5;

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchTransactions(currentUser.uid);
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
                if (data.type === "Withdraw") totalBalance -= data.amount;
                if (data.type === "Invest") totalBalance -= data.amount;
                return { id: doc.id, ...data };
            });

            setTransactions(txnList);
            setBalance(totalBalance);
            setLoading(false);
        });

        return unsubscribe;
    };
    // Sort transactions by timestamp (newest first)
    const sortedTransactions = transactions
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Get transactions for the current page
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + transactionsPerPage);

    // Calculate total pages
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    return (
        <div className='bg-gradient-to-br from-[#0FA280] to-[#054D3B] text-gray-900 font-sans min-h-screen flex flex-col items-center pb-20'>
            <div className='w-full max-w-2xl px-4 pt-6'>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-lg rounded-xl p-4 w-full text-center border border-gray-200 relative overflow-hidden"
                >
                    <h2 className="text-sm font-semibold text-gray-600">Available Balance</h2>
                    <p className="text-xl font-bold text-[#0FA280]">NGN {balance.toLocaleString()}</p>
                    <CircleDollarSign className='text-[#0fa280] w-16 h-16 opacity-20 rotate-12 scale-200 absolute right-12 top-5 select-none pointer-events-none' />
                    <Banknote className='text-[#0FA280] w-16 h-16 opacity-20 -rotate-12 scale-200 absolute left-12 top-5 select-none pointer-events-none' />                {/* Balance Section */}
                </motion.div>

                {/* Quick Actions */}
                <div className="mt-4 w-full grid grid-cols-2 gap-4">
                    {["Deposit", "Withdraw"].map((action, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center bg-white p-3 rounded-lg shadow-md hover:shadow-xl transition"
                            onClick={() => navigate(`/transact/${action.toLowerCase()}`)}
                        >
                            {action === "Deposit" ? <ArrowDownLeft className="text-green-600 w-5 h-5" /> : <ArrowUpRight className="text-red-600 w-5 h-5" />}
                            <span className="text-sm font-semibold mt-2">{action}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Transaction History */}
                <div className="mt-4 w-full">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader className="animate-spin text-white w-8 h-8" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <p className="text-white text-center">No transactions yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {paginatedTransactions.map((txn, index) => (
                                <motion.div
                                    key={txn.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-gray-100 shadow-md rounded-xl p-4 py-2 flex items-center gap-4 overflow-hidden"
                                >
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${txn.type === "Deposit" ? "bg-green-400" : txn.type === "Invest" ? "bg-blue-400" : "bg-red-400"}`}>
                                        {txn.type === "Deposit" ? <ArrowDownLeft className="w-5 h-5" /> : txn.type === "Invest" ? <Wallet className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div className="z-10">
                                        <h1 className="font-semibold text-gray-900 sm:text-lg">{txn.type}</h1>
                                        <span className="text-xs sm:text-sm text-gray-800">{new Date(txn.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="ml-auto font-bold text-gray-900">NGN {txn.amount.toLocaleString()}</div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {transactions.length > transactionsPerPage && (
                        <div className="flex justify-center items-center space-x-4 mt-6">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-full shadow-md"
                            >
                                <ChevronLeftCircle className={`${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-white"}`} />
                            </button>
                            <span className="font-semibold text-white">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-full shadow-md"
                            >
                                <ChevronRightCircle className={`${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-white"}`} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Footer */}
            <Footer page="transact" />
        </div>
    );
};

export default Transact;
