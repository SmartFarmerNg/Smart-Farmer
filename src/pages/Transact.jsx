import React, { useState } from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/component/Footer";

const transactions = [
    { type: "Deposit", amount: 5000, date: "March 28, 2025", icon: <ArrowDownLeft />, color: "bg-green-500" },
    { type: "Withdraw", amount: 2000, date: "March 26, 2025", icon: <ArrowUpRight />, color: "bg-red-500" },
    { type: "Transfer", amount: 1500, date: "March 25, 2025", icon: <ArrowRight />, color: "bg-blue-500" }
];

const Transact = () => {
    const [balance, setBalance] = useState(1500);

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900">
            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center px-4 py-10">
                {/* Balance Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center border border-gray-200"
                >
                    <h2 className="text-lg font-semibold text-gray-600">Available Balance</h2>
                    <p className="text-3xl font-bold text-[#0FA280]">${balance.toLocaleString()}</p>
                </motion.div>

                {/* Quick Actions */}
                <div className="mt-6 w-full max-w-md grid grid-cols-2 gap-4 bg-white shadow-md rounded-lg">
                    {[
                        { name: "Deposit", icon: <ArrowDownLeft className="text-[#0FA280] w-8 h-8" /> },
                        { name: "Withdraw", icon: <ArrowUpRight className="text-[#0FA280] w-8 h-8" /> }
                    ].map((action, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center p-4 hover:shadow-lg"
                        >
                            {action.icon}
                            <span className="text-sm font-semibold mt-2">{action.name}</span>
                        </motion.button>
                    ))}
                </div>
                {/* Transaction History */}
                <div className="mt-8 w-full max-w-md">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>
                    <div className="flex flex-col gap-3">
                        {transactions.map((txn, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-100 shadow-md rounded-xl p-4 flex items-center gap-4 overflow-hidden"
                            >
                                <div className={`w-10 h-10 scale-250 -translate-x-1 opacity-30 flex items-center justify-center rounded-full text-white ${txn.color}`}>
                                    {txn.icon}
                                </div>
                                <div>
                                    <h1 className="font-semibold text-gray-700">{txn.type}</h1>
                                    <span className="text-xs text-gray-500">{txn.date}</span>
                                </div>
                                <div className="ml-auto font-bold text-gray-900">${txn.amount.toLocaleString()}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer page="transact" />
        </div>
    );
};

export default Transact;
