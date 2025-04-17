import { useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { auth } from '../../../firebase';

const AccountSettings = () => {
    const user = auth.currentUser;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus("Passwords don't match.");
            return;
        }

        setLoading(true);
        try {
            await updatePassword(user, newPassword);
            setStatus('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setStatus(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
            >
                {/* Display Email */}
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">Email</label>
                    <input
                        type="text"
                        value={user?.email}
                        readOnly
                        className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                    />
                </div>

                {/* Change Password */}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white/20 hover:bg-white/30 transition-all duration-300 px-6 py-2 rounded-xl text-white font-semibold mt-2"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>

                    {status && <p className="text-sm text-red-400 mt-2">{status}</p>}
                </form>
            </motion.div>
        </div>
    );
};

export default AccountSettings;
