import { useState } from 'react';
import { motion } from 'framer-motion';
import AccountSettings from '../components/component/Settings/AccountSettings';
import SecuritySettings from '../components/component/Settings/SecuritySettings';
import AppearanceSettings from '../components/component/Settings/AppearanceSettings';
import NotificationSettings from '../components/component/Settings/NotificationSettings';
import SettingsTabs from '../components/component/Settings/SettingsTabs';
import WithdrawalSettings from '../components/component/Settings/WithdrawalSettings';
import DangerZone from '../components/component/Settings/DangerZone';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');

    const renderTab = () => {
        switch (activeTab) {
            case 'account':
                return <AccountSettings />;
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
        <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Tabs: full width on mobile, sidebar on desktop */}
                <div className="w-full sm:w-1/4">
                    <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
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
    );
};

export default Settings;
