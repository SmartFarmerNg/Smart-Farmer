import { ArrowRightLeft, ChartBar, Home, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = ({ page }) => {
    const navigate = useNavigate();
    const menuItems = [
        { name: 'Home', icon: Home, route: '/dashboard', key: 'dashboard' },
        { name: 'Invest', icon: ChartBar, route: '/invest', key: 'invest' },
        { name: 'Transact', icon: ArrowRightLeft, route: '/transact', key: 'transact' },
        { name: 'Profile', icon: UserCircle, route: '/profile', key: 'profile' }
    ];

    return (
        <footer className='fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-white/15 shadow-lg rounded-full flex items-center justify-around px-2 py-3 w-[90%] md:w-[60%] backdrop-blur-lg border border-gray-200'>
            {menuItems.map(({ name, icon: Icon, route, key }) => (
                <motion.button
                    key={key}
                    onClick={() => navigate(route)}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center text-xs transition-all ${page === key ? 'text-[#0FA280] font-bold' : 'text-gray-500'}`}
                >
                    <Icon className={`w-5 h-5 transition-all ${page === key ? 'text-[#0FA280] scale-110' : 'text-gray-400'}`} />
                    {name}
                </motion.button>
            ))}
        </footer>
    );
};

export default Footer;
