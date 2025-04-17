import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const WithdrawalSettings = () => {
    const [user, setUser] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [bankName, setBankName] = useState('');
    const [withdrawalLimit, setWithdrawalLimit] = useState('5000');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const handleUpdateBankAccount = (e) => setBankAccount(e.target.value);
    const handleUpdateBankName = (e) => setBankName(e.target.value);
    const handleUpdateWithdrawalLimit = (e) => setWithdrawalLimit(e.target.value);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUser(currentUser.uid);
                const unsubscribeTransactions = fetchTransactions(currentUser.uid);
                return () => unsubscribeTransactions();
            } else {
                navigate("/sign-in");
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const fetchUser = async (userId) => {
        const userRef = doc(db, "users", userId);
        const unsubscribe = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                const userData = doc.data();
                setBankAccount(userData.bankAccount || '');
                setBankName(userData.bankName || '');
                setWithdrawalLimit(userData.withdrawalLimit || '5000');
            }
            setLoading(false);
        });

        return unsubscribe;
    };


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
            console.log(txnList);

            setLoading(false);
        });

        return unsubscribe;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!bankAccount || !bankName) {
            setError('Please fill in all fields.');
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                bankAccount: bankAccount,
                bankName: bankName,
                withdrawalLimit: withdrawalLimit
            });

            setSuccess('Withdrawal settings updated successfully!');
        } catch (error) {
            setError('Failed to update withdrawal settings. Please try again.');
            console.error("Error updating withdrawal settings:", error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Withdrawal Settings</h2>

            {/* Bank Account Section */}
            <div className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Bank Account</label>
                    <input
                        type="text"
                        className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your bank account number"
                        value={bankAccount}
                        onChange={handleUpdateBankAccount}
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">Bank Name</label>
                    <select
                        className="w-full bg-gray-900 border border-white/10 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={bankName}
                        onChange={handleUpdateBankName}
                        required
                    >
                        <option value="">Select your bank</option>
                        <option value="access">Access Bank</option>
                        <option value="gtb">Guaranty Trust Bank</option>
                        <option value="zenith">Zenith Bank</option>
                        <option value="firstbank">First Bank</option>
                        <option value="uba">United Bank for Africa</option>
                        <option value="opay">Opay</option>
                        <option value="plmpay">PalmPay</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">Withdrawal Limit</label>
                    <input
                        type="text"
                        className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={withdrawalLimit}
                        onChange={handleUpdateWithdrawalLimit}
                        required
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-2 px-4 rounded-lg font-medium"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Updating..." : "Update Withdrawal Settings"}
            </button>

            {/* Error/Success Messages */}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            {/* Transaction History Section */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
                {loading ? (
                    <p>Loading transactions...</p>
                ) : (
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="text-left">
                                <th className="px-4 py-2 text-sm font-medium">Date</th>
                                <th className="px-4 py-2 text-sm font-medium">Amount</th>
                                <th className="px-4 py-2 text-sm font-medium">Type</th>
                                <th className="px-4 py-2 text-sm font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={index} className="border-b border-white/10">
                                    <td className="px-4 py-2 text-sm">{new Date(transaction.timestamp).toLocaleDateString()}</td>
                                    <td className={`px-4 py-2 text-sm ${transaction.type === 'Deposit' ? 'text-green-500' : transaction.type === 'Withdrawal' ? 'text-red-500' : 'text-blue-500'}`}>NGN {transaction.type === 'Deposit' ? '+' : '-'}{transaction.amount.toLocaleString()}</td>
                                    <td className={`px-4 py-2 text-sm ${transaction.type === 'Deposit' ? 'text-green-500' : transaction.type === 'Withdrawal' ? 'text-red-500' : 'text-blue-500'}`}>{transaction.type}</td>
                                    <td className="px-4 py-2 text-sm">{transaction.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>)}
            </div>
        </div>
    );
};

export default WithdrawalSettings;