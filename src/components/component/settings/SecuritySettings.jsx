import { useState } from 'react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TwoFactorAuth from '../TwoFactorAuth';

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmNewPasswordVisibility = () => setShowConfirmNewPassword(!showConfirmNewPassword);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      setError('No authenticated user');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      // Re-authenticate user
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('The current password is incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'An error occurred while updating your password.');
      }
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Security Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Current Password</label>
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <span
            onClick={toggleCurrentPasswordVisibility}
            className="absolute top-10 right-4 text-gray-400 cursor-pointer"
          >
            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="relative">
          <label className="block mb-1 text-sm font-medium">New Password</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span
            onClick={toggleNewPasswordVisibility}
            className="absolute top-10 right-4 text-gray-400 cursor-pointer"
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Confirm New Password</label>
          <input
            type={showConfirmNewPassword ? 'text' : 'password'}
            className="w-full bg-white/10 border border-white/10 p-3 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span
            onClick={toggleConfirmNewPasswordVisibility}
            className="absolute top-10 right-4 text-gray-400 cursor-pointer"
          >
            {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>


        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-blue-400 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-white hover:bg-white/70 transition-colors text-black py-2 px-4 rounded-lg font-medium"
        >
          Update Password
        </button>
      </form>
      <TwoFactorAuth />
    </div>
  );
};

export default SecuritySettings;
