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
        <footer className='fixed bottom-2 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full flex items-center justify-around px-2 py-3 w-[90%] max-w-2xl backdrop-blur-sm border border-gray-200'>
            {menuItems.map(({ name, icon: Icon, route, key }) => (
                <motion.button
                    key={key}
                    onClick={() => navigate(route)}
                    whileTap={{ scale: 0.5 }}
                    className={`flex flex-col items-center text-xs transition-all ${page === key ? 'text-[#054D3B] scale-120 font-bold' : 'text-gray-600'} cursor-pointer`}
                >
                    <Icon className={`w-5 h-5 transition-all ${page === key ? 'text-[#054D3B]' : 'text-gray-600'}`} />
                    {name}
                </motion.button>
            ))}
        </footer>
    );
};
export default Footer;
