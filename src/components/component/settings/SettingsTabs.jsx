import { useEffect } from 'react';
import { FaShieldAlt, FaPaintBrush, FaBell, FaCreditCard, FaExclamationTriangle, FaEdit, FaPencilAlt } from 'react-icons/fa';

const tabs = [
  { key: 'editProfile', label: 'Edit Profile', icon: <FaPencilAlt /> },
  { key: 'security', label: 'Security', icon: <FaShieldAlt /> },
  { key: 'appearance', label: 'Appearance', icon: <FaPaintBrush /> },
  { key: 'notifications', label: 'Notifications', icon: <FaBell /> },
  { key: 'withdrawals', label: 'Withdrawals', icon: <FaCreditCard /> },
  { key: 'danger', label: 'Danger Zone', icon: <FaExclamationTriangle /> },
];

const SettingsTabs = ({ activeTab, setActiveTab, theme, accent }) => {
  useEffect(() => {
    // Load the active tab from localStorage if available
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, [setActiveTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem('activeTab', tabKey); // Save active tab to localStorage
  };

  return (
    <div className="w-full">
      {/* Mobile: Horizontal Scrollable Tabs */}
      <div className="sm:hidden mb-4 flex overflow-x-auto gap-3 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap text-sm font-medium
              ${activeTab === tab.key
                ? 'font-semibold'
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            style={{
              backgroundColor: activeTab === tab.key ? accent : 'transparent',
              color: activeTab === tab.key ? (accent === '#ECF87F' || accent === '#75E6DA' ? 'black' : 'white') : 'white',
            }}
          >
            <div className="flex items-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop: Vertical Sidebar */}
      <div className="hidden sm:flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`text-left px-4 py-5 rounded-sm transition-all duration-200 font-medium
              ${activeTab === tab.key
                ? `bg-[${accent}] ${accent === '#ECF87F' || accent === '#75E6DA' ? 'text-black' : 'text-white'} font-semibold`
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <div className="flex items-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsTabs;
