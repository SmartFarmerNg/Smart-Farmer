import React, { useEffect, useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast, ToastContainer } from 'react-toastify';

const EditProfile = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;
    console.log(user);


    const [displayName, setDisplayName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    const [photoFile, setPhotoFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            setDisplayName(user.displayName || '');
            setPreviewImage(user.photoURL || '');

            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                const data = snap.data();
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setPhoneNumber(data.phoneNumber || '');
            }
        };
        fetchUserData();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!displayName || !firstName || !lastName) {
            toast.success('Please fill in all required fields.');
            return;
        }

        setLoading(true);
        // let photoURL = user?.photoURL || '';

        try {
            // if (photoFile) {
            //     const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
            //     await uploadBytes(storageRef, photoFile);
            //     photoURL = await getDownloadURL(storageRef);
            // }

            await updateProfile(user, {
                displayName: firstName,
                photoURL: previewImage,
            });

            const userRef = doc(db, 'users', user.uid);
            await setDoc(
                userRef,
                {
                    firstName,
                    lastName,
                    phoneNumber,
                },
                { merge: true }
            );
            toast.success('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Something went wrong while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=''>
            <ToastContainer position="top-right" autoClose={2300} />
            <div className='text-gray-200 rounded-xl p-5 space-y-4 z-50'>
                <div className='flex flex-col items-center relative w-24 h-24 mx-auto'>
                    <img
                        src={previewImage || 'https://via.placeholder.com/150'}
                        alt='Profile'
                        className='w-24 h-24 object-cover rounded-full border shadow'
                    />
                    <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageChange}
                        className='absolute inset-0 opacity-0 cursor-pointer'
                        title='Change Profile Image'
                    />
                </div>

                {/* Form Fields */}
                <div className='flex flex-col gap-4 text-sm'>
                    <label>
                        First Name
                        <input
                            type='text'
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-white'
                        />
                    </label>

                    <label>
                        Last Name
                        <input
                            type='text'
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-white'
                        />
                    </label>

                    <label>
                        Phone Number
                        <input
                            type='tel'
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className='w-full px-3 py-2 mt-1 border border-gray-300 rounded-md text-white'
                        />
                    </label>
                </div>

                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={loading}
                    className='w-full flex items-center justify-center gap-2 bg-[#0FA280] text-white py-2 px-4 rounded-lg shadow hover:bg-[#0c8a6a]'
                >
                    <Save className='w-5 h-5' />
                    {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
            </div>
        </div>
    );
};

export default EditProfile;
