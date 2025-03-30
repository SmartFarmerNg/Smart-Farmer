import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Barloader from '../components/component/Barloader';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        referralCode: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { firstName, lastName, email, password, confirmPassword, phoneNumber, referralCode } = formData;

        if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword) {
            toast.error('Please fill in all fields');
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            await updateProfile(user, {
                displayName: firstName,
                photoURL: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            });

            await setDoc(doc(db, 'users', user.uid), {
                firstName,
                lastName,
                uid: user.uid,
                email: user.email,
                phoneNumber,
                referralCode,
                createdAt: new Date().toISOString(),
            });

            toast.success('Registration successful! Please check your email to verify your account.');
            setTimeout(() => navigate('/sign-in'), 5000);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email already in use');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Invalid email');
            } else {
                toast.error('Error signing up: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='h-screen flex flex-col items-center bg-gray-100 text-gray-900 font-sans'>
            {isLoading && <Barloader />}
            <ToastContainer position="top-right" autoClose={5000} />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='w-full sm:w-[60%] lg:w-[40%] bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center'
            >
                <h1 className='font-bold text-3xl text-blue-500'>Register</h1>
                <p className='text-gray-600'>Enter your personal information</p>
                <form className="flex flex-col gap-4 items-center w-full" onSubmit={handleSubmit}>
                    {['firstName', 'lastName', 'email', 'phoneNumber', 'referralCode'].map((field) => (
                        <input
                            key={field}
                            className='w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            type={field === 'email' ? 'email' : 'text'}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            id={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required={field !== 'referralCode'}
                        />
                    ))}
                    {[['password', showPassword, setShowPassword], ['confirmPassword', showConfirmPassword, setShowConfirmPassword]].map(([field, show, setShow]) => (
                        <div key={field} className='relative w-full'>
                            <input
                                className='w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                                type={show ? 'text' : 'password'}
                                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                id={field}
                                value={formData[field]}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500'
                                onClick={() => setShow(!show)}
                            >
                                {show ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    ))}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className='bg-blue-500 hover:bg-blue-600 p-3 w-full font-semibold text-lg rounded-lg text-white shadow-md'
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className='animate-spin m-auto w-6 h-6' /> : 'Register'}
                    </motion.button>
                    <span className='text-gray-600'>
                        Already have an account? <Link to="/sign-in" className='text-blue-500 hover:text-blue-600'>Sign in</Link>
                    </span>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;