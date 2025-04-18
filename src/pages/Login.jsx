import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from "framer-motion";
import FloatingBackground from '../components/component/FloatingBackground';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify(user));

      if (!user.emailVerified) {
        toast.error('Please verify your email before logging in.');
        await sendEmailVerification(user);

        await auth.signOut();
        setIsLoading(false);
        return;
      }

      toast.success('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      const errorMessages = {
        'auth/invalid-email': 'Invalid email',
        'auth/user-not-found': 'User not found',
        'auth/invalid-credential': 'Incorrect email/password',
        'auth/too-many-requests': 'Too many attempts. Please reset your password.'
      };
      toast.error(errorMessages[error.code] || 'Error logging in: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      toast.error('Error sending reset email: ' + error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0FA280] to-[#054D3B]">
      <ToastContainer position="top-right" autoClose={2300} />
      <motion.div
        className=" bg-white/15 backdrop-blur-xs shadow-xl p-8 rounded-2xl w-[95%] sm:w-[60%] lg:w-[40%] flex flex-col items-center border border-gray-200 z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white">Login</h1>
        <p className="text-gray-100 mt-2">Access your account</p>

        <form className="w-full flex flex-col mt-6 space-y-5" onSubmit={handleSubmit} disabled={isLoading}>
          <div className="flex flex-col">
            <label className="text-gray-100 font-semibold">Email</label>
            <input
              type="email"
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0FA280] text-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative flex flex-col">
            <label className="text-gray-100 font-semibold">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0FA280] text-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="text-gray-100" /> : <Eye className="text-gray-100" />}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-[#0FA280] hover:bg-[#0FA280] text-white p-3 w-full rounded-lg font-semibold text-lg"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin mx-auto text-white h-7 w-7" /> : 'Log in'}
          </motion.button>

          <div className="text-center">
            <span className="text-gray-100">Don't have an account? </span>
            <Link to="/sign-up" className="cursor-pointer text-blue-800 hover:text-[#0FA280] font-semibold">Sign up</Link>
          </div>

          <button
            type="button"
            className="cursor-pointer text-blue-800 hover:text-[#0FA280] font-semibold mt-2 w-fit mx-auto"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
