import { ArrowRightLeft, Banknote, Briefcase, ChartNoAxesColumn, Home, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Adjust the path to your Firebase config
import { onAuthStateChanged } from 'firebase/auth';
import Footer from '../components/component/Footer';
import Barloader from '../components/component/Barloader';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // State to store the logged-in user's data
    const [loading, setLoading] = useState(true); // State to track loading status

    useEffect(() => {
        // Set up the Firebase auth state observer
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // If a user is logged in, store their data in state
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                });
            } else {
                // If no user is logged in, redirect to the login page
                navigate('/sign-in');
            }
            setLoading(false); // Set loading to false once the user data is fetched
        });

        // Clean up the observer when the component unmounts
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <>
            <Barloader /> {/*  Show a loading indicator while checking auth state */}
            <Footer page='dashboard' />
        </>
    }

    return (
        <div className='h-screen w-full flex flex-col items-center bg-[#FFFBFA] py-4 font-sans'>
            <h1 className='text-xl font-bold'>Invest</h1>
            <div className='flex items-center gap-5 w-full md:w-[70%] lg:w-[50%] p-5'>
                <button className='bg-[#0FA280] flex gap-2 px-2 p-1 w-full rounded-md'>
                    <Banknote className='text-white w-6 h-6' />
                    <div className='flex flex-col items-start'>
                        <p className='text-sm font-semibold text-[#B4C5B4]'>Cash</p>
                        <p className='text-white font-semibold text-sm'>$150,250</p>
                    </div>
                </button>
                <button className='bg-[#0FA280] flex gap-2 px-2 p-1 w-full rounded-md'>
                    <Briefcase className='text-white w-5 h-6' />
                    <div className='flex flex-col items-start'>
                        <p className='text-sm font-semibold text-[#B4C5B4]'>Assets</p>
                        <p className='text-white font-semibold text-sm'>$530,000</p>
                    </div>
                </button>
            </div>
            <section className='w-full md:w-[70%] lg:w-[50%] p-5'>
                <input type="text" className='w-full p-2 border rounded-md' placeholder='Search' />
                <h1 className='text-lg font-bold mt-2'>Top crops to invest in</h1>
                <div className='flex flex-wrap items-center justify-between mt-2'>
                    <div className='flex items-center gap-2 w-[47%] mt-5 rounded-md shadow-2xl p-3 border-b border-[#0FA280]'>
                        <h2 className='font-semibold'>Maize</h2>
                    </div>
                    <div className='flex items-center gap-2 w-[47%] mt-5 rounded-md shadow-2xl p-3 border-b border-[#0FA280]'>
                        <h2 className='font-semibold'>Cassava</h2>
                    </div>
                    <div className='flex items-center gap-2 w-[47%] mt-5 rounded-md shadow-2xl p-3 border-b border-[#0FA280]'>
                        <h2 className='font-semibold'>Cocoa</h2>
                    </div>
                    <div className='flex items-center gap-2 w-[47%] mt-5 rounded-md shadow-2xl p-3 border-b border-[#0FA280]'>
                        <h2 className='font-semibold'>Palm oil</h2>
                    </div>
                </div>
            </section>
            <Footer page='dashboard' />
        </div>
    );
};

export default Dashboard;