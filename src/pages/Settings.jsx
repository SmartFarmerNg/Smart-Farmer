import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SecuritySettings from '../components/component/settings/SecuritySettings.jsx';
import AppearanceSettings from '../components/component/settings/AppearanceSettings.jsx';
import NotificationSettings from '../components/component/settings/NotificationSettings.jsx';
import SettingsTabs from '../components/component/settings/SettingsTabs.jsx';
import WithdrawalSettings from '../components/component/settings/WithdrawalSettings.jsx';
import DangerZone from '../components/component/settings/DangerZone.jsx';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EditProfile from './EditProfile';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');
    const navigate = useNavigate();

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [accent, setAccent] = useState(localStorage.getItem('accent') || '#0FA280');

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser?.uid), (doc) => {
            if (doc.exists()) {
                setTheme(doc.data().theme || 'light');
                setAccent(doc.data().accent || '#0FA280');
            }
        });

        return () => unsubscribe();
    }, []);

    const renderTab = () => {
        switch (activeTab) {
            case 'editProfile':
                return <EditProfile />;
            case 'security':
                return <SecuritySettings />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'withdrawals':
                return <WithdrawalSettings />;
            case 'danger':
                return <DangerZone />;
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen p-4 sm:p-6 text-white w-full mx-auto shadow-lg ${theme === 'dark' ? ' bg-gray-900' : ''}`}>
            <div className=' max-w-5xl mx-auto'>
                <button className='flex items-center mb-4' onClick={() => navigate('/profile')}>
                    <ArrowLeft className="mr-2" />
                    <span className="text-2xl font-semibold">Account Settings</span>
                </button>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Tabs: full width on mobile, sidebar on desktop */}
                    <div className="w-full sm:w-1/4 sm:sticky sm:top-4">
                        <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} accent={accent} />
                    </div>

                    {/* Content Panel */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full sm:flex-1 backdrop-blur-md bg-white/5 rounded-2xl p-4 sm:p-6 shadow-xl border border-white/10"
                    >
                        {renderTab()}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
