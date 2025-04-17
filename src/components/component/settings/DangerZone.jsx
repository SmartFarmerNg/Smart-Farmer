import { useState } from 'react';
import { getAuth, deleteUser } from 'firebase/auth';
import { getFirestore, doc, updateDoc, deleteDoc, collection, query, getDocs, where } from 'firebase/firestore';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Assuming you are using react-router for navigation
import { toast, ToastContainer } from 'react-toastify';

const DangerZone = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate(); // To navigate user away after deletion

  const handleDeleteAccount = async () => {
    setError('');
    setSuccess('');
    setIsDeleting(true);

    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    if (!user) {
      setError('No authenticated user');
      setIsDeleting(false);
      return;
    }

    try {
      // Delete associated Firestore data (user document)
      const userRef = doc(db, 'users', user.uid);
      // Delete user's transactions
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      await deleteDoc(userRef);

      // Delete user's data from investors subcollection
      const quickInvestmentsRef = collection(db, "quickInvestments");
      const quickInvestmentsSnapshot = await getDocs(quickInvestmentsRef);

      const investorDeletePromises = quickInvestmentsSnapshot.docs.map(async (quickInvestDoc) => {
        const investorsRef = collection(quickInvestDoc.ref, "investors");
        const investorQuery = query(investorsRef, where("uid", "==", user.uid));
        const investorSnapshot = await getDocs(investorQuery);
        return Promise.all(investorSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      });

      await Promise.all(investorDeletePromises);

      // Delete user's data from investors subcollection
      const investmentProductsRef = collection(db, "investmentProducts");
      const investmentProductsSnapshot = await getDocs(investmentProductsRef);

      const investorInvesmentProductsDeletePromises = investmentProductsSnapshot.docs.map(async (quickInvestDoc) => {
        const investorsRef = collection(quickInvestDoc.ref, "investors");
        const investorQuery = query(investorsRef, where("uid", "==", user.uid));
        const investorSnapshot = await getDocs(investorQuery);
        return Promise.all(investorSnapshot.docs.map(doc => deleteDoc(doc.ref)));
      });

      await Promise.all(investorInvesmentProductsDeletePromises);

      // Delete account from Firebase Auth
      await deleteUser(user);

      toast.success('Account deleted successfully!');
      setIsDeleting(false);

      // Redirect to login page or homepage
      navigate('/sign-up');
    } catch (err) {
      console.error(err);
      setError('There was an issue deleting your account. Please try again later.');
      setIsDeleting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setError('');
    setSuccess('');

    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    if (!user) {
      setError('No authenticated user');
      return;
    }

    try {
      // Update Firestore user document to mark as deactivated
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { isActive: false });

      setSuccess('Account deactivated successfully!');
    } catch (err) {
      console.error(err);
      setError('There was an issue deactivating your account. Please try again later.');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={2300} />
      <h2 className="text-2xl font-semibold mb-4">Danger Zone</h2>

      {/* Account Deactivation */}
      <div className="bg-amber-500 text-white p-4 rounded-lg">
        <h3 className="font-semibold">Deactivate Account</h3>
        <p className="text-sm">
          If you want to temporarily deactivate your account, you can do so here. You will be able to reactivate it later.
        </p>
        <button
          onClick={handleDeactivateAccount}
          className="mt-4 bg-amber-600 hover:bg-amber-800 transition-colors text-white py-2 px-4 rounded-lg font-medium"
        >
          Deactivate Account
        </button>
      </div>

      {/* Account Deletion */}
      <div className="bg-red-900 text-white p-4 rounded-lg">
        <h3 className="font-semibold">Delete Account</h3>
        <p className="text-sm">
          Deleting your account is permanent and cannot be undone. All data will be lost, including your investments and
          transaction history.
        </p>

        {showConfirmation ? (
          <>
            <p className="text-sm text-yellow-300 mt-2">
              <FaExclamationTriangle className="inline mr-2" />
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-800 hover:bg-red-900 transition-colors text-white py-2 px-4 rounded-lg font-medium"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-600 hover:bg-gray-700 transition-colors text-white py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setShowConfirmation(true)}
            className="mt-4 bg-red-700 hover:bg-red-800 transition-colors text-white py-2 px-4 rounded-lg font-medium"
          >
            Delete Account
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}
    </div>
  );
};

export default DangerZone;
