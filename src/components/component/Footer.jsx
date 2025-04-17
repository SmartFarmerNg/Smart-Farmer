import { ArrowRightLeft, ChartBar, Home, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Footer = ({ page }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [accent, setAccent] = useState(localStorage.getItem('accent') || '#0FA280');
    const navigate = useNavigate();


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user?.uid) {
                const userRef = doc(db, "users", user.uid);
                const unsubscribeSnap = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setTheme(docSnap.data().theme || 'light');
                        setAccent(docSnap.data().accent || '#0FA280');
                    }
                });

                // Cleanup Firestore listener
                return () => unsubscribeSnap();
            }
        });

        // Cleanup auth listener
        return () => unsubscribeAuth();
    }, []);


    const menuItems = [
        { name: 'Home', icon: Home, route: '/dashboard', key: 'dashboard' },
        { name: 'Invest', icon: ChartBar, route: '/invest', key: 'invest' },
        { name: 'Transact', icon: ArrowRightLeft, route: '/transact', key: 'transact' },
        { name: 'Profile', icon: UserCircle, route: '/profile', key: 'profile' }
    ];

    return (
        <footer
            className={`fixed bottom-2 left-1/2 transform -translate-x-1/2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-around px-2 py-3 w-[90%] max-w-3xl backdrop-blur-sm border border-gray-200 z-50`}
        >
            {menuItems.map(({ name, icon: Icon, route, key }) => (
                <motion.button
                    key={key}
                    onClick={() => navigate(route)}
                    whileTap={{ scale: 0.7 }}
                    className={`flex flex-col items-center text-xs transition-all cursor-pointer ${page === key
                        ? 'scale-110 font-bold'
                        : theme === 'dark'
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                    style={page === key ? { color: accent } : {}}
                >
                    <Icon className="w-5 h-5 transition-all" />
                    {name}
                </motion.button>
            ))}
        </footer>
    );
};

export default Footer;
