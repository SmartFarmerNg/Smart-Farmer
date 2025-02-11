import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Barloader from '../components/component/Barloader';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

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
      console.log('User logged in:', userCredential.user);
      toast.success('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard'); // Redirect to the home page or dashboard
      }, 5000); // Redirect after 5 seconds
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('User not found');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else {
        toast.error('Error logging in: ' + error.message);
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
      <div className='w-full sm:w-[60%] lg:w-[40%] flex flex-col justify-center items-center rounded-lg m-auto'>
        <h1 className='font-semibold text-2xl'>Login</h1>
        <p>Log in to continue using the app</p>
        <form className="flex flex-col gap-3 items-center w-full p-10" onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className='bg-[#0FA280] hover:bg-[#0fa270] p-3 w-full font-semibold text-xl rounded-lg text-white'
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className='animate-spin m-auto w-7 h-7' />
            ) : 'Log in'}
          </button>
          <span>
            Don't have an account?{' '}
            <Link to="/sign-up" className='text-[#0FA280] hover:text-[#0fa270]'>
              Sign up
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;