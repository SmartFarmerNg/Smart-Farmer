import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Barloader from '../components/component/Barloader';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed up:', userCredential.user);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/sign-in'); // Redirect to the login page
            }, 3000); // Redirect after 3 seconds
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Email already in use');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Invalid email');
            } else if (error.code === 'auth/password-does-not-meet-requirements') {
                toast.error('Weak password (minimum 6 characters, at least one uppercase letter, one lowercase letter, one special character, and one number)');
            } else {
                toast.error('Error signing up: ' + error.mesage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='h-screen flex flex-col items-center bg-[#E7F6F2]'>
            {isLoading && <Barloader />}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className='w-full sm:w-[60%] lg:w-[40%] bg-[#E7F6F2] flex flex-col justify-center items-center rounded-lg m-auto'>
                <h1 className='font-semibold text-2xl'>Register</h1>
                <p>Enter your personal information</p>
                <form className="flex flex-col gap-3 items-center w-full p-10" onSubmit={handleSubmit}>
                    <label className='font-bold text-lg flex flex-col gap-1 w-full' htmlFor="username">
                        Username
                        <input
                            className='w-full p-3 rounded-md border border-[#0FA280]'
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>
                    <label className='font-bold text-lg flex flex-col gap-1 w-full' htmlFor="email">
                        Email
                        <input
                            className='w-full p-3 rounded-md border border-[#0FA280]'
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                    <label className='font-bold text-lg flex flex-col gap-1 w-full relative' htmlFor="password">
                        Password
                        <input
                            className='w-full p-3 rounded-md border border-[#0FA280]'
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className='absolute right-3 top-2/3 transform -translate-y-1/2 cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className='text-[#0FA280]' /> : <Eye className='text-[#0FA280]' />}
                        </button>
                    </label>
                    <label className='font-bold text-lg flex flex-col gap-1 w-full relative' htmlFor="confirmPassword">
                        Confirm Password
                        <input
                            className='w-full p-3 rounded-md border border-[#0FA280]'
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className='absolute right-3 top-5/7 transform -translate-y-1/2 cursor-pointer'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                            {showConfirmPassword ? <EyeOff className='text-[#0FA280]' /> : <Eye className='text-[#0FA280]' />}
                        </button>
                    </label>
                    <button
                        type="submit"
                        className='bg-[#0FA280] hover:bg-[#0fa270] p-3 w-full font-semibold text-xl rounded-lg text-white'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className='animate-spin m-auto w-7 h-7' />
                        ) : 'Register'}
                    </button>
                    <span>
                        Do you have an account?{' '}
                        <Link to="/sign-in" className='text-[#0FA280] hover:text-[#0fa270]'>
                            Sign in
                        </Link>
                    </span>
                </form>
            </div>
        </div>
    );
};

export default Register;