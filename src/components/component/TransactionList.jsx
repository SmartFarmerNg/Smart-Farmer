import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    ArrowDownLeft,
    ArrowUpRight,
    Wallet,
    ChevronLeftCircle,
    ChevronRightCircle,
    Loader,
} from "lucide-react";

const TransactionList = ({ transactions, loading, theme, accent }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedType, setSelectedType] = useState("All");
    const transactionsPerPage = 5;

    const filteredTransactions = useMemo(() => {
        const filtered = selectedType === "All"
            ? [...transactions]
            : transactions.filter((txn) => txn.type === selectedType);
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [transactions, selectedType]);

    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * transactionsPerPage,
        currentPage * transactionsPerPage
    );

    const typeOptions = ["All", "deposit", "invest", "Withdraw"];

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2,
        }).format(value);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>

            {/* Tab Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {typeOptions.map((type) => (
                    <button
                        key={type}
                        onClick={() => {
                            setSelectedType(type);
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all`}
                        style={{
                            backgroundColor: selectedType === type ? accent : '#d1d5dc',
                            color: selectedType === type ? '#fff' : '#333',
                        }}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader className="animate-spin text-white w-8 h-8" />
                </div>
            ) : filteredTransactions.length === 0 ? (
                <p className="text-white text-center">No transactions found.</p>
            ) : (
                <div className="flex flex-col">
                    {paginatedTransactions.map((txn, index) => (
                        <motion.div
                            key={txn.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`${theme === "dark" ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 border border-gray-300'} shadow-md border-b px-4 py-2 flex items-center gap-2 overflow-hidden`}
                        >
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${txn.type === "deposit"
                                    ? "bg-green-400"
                                    : txn.type === "invest"
                                        ? "bg-blue-400"
                                        : "bg-red-400"
                                    }`}
                            >
                                {txn.type === "deposit" ? (
                                    <ArrowDownLeft className="w-5 h-5" />
                                ) : txn.type === "invest" ? (
                                    <Wallet className="w-5 h-5" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5" />
                                )}
                            </div>
                            <div className="z-10">
                                <h1 className="font-semibold sm:text-lg">{txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}</h1>
                                <span className="text-xs sm:text-sm ">
                                    {formatDate(txn.createdAt)}
                                </span>
                            </div>
                            <div className="ml-auto font-bold ">
                                {formatCurrency(txn.amount)}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {filteredTransactions.length > transactionsPerPage && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded-full shadow-md"
                    >
                        <ChevronLeftCircle
                            className={`w-6 h-6 ${currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-white"
                                }`}
                        />
                    </button>
                    <span className="font-semibold text-white">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded-full shadow-md"
                    >
                        <ChevronRightCircle
                            className={`w-6 h-6 ${currentPage === totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-white"
                                }`}
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionList;