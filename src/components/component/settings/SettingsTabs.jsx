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
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      setActiveTab(storedTab);
    } else {
      setActiveTab('editProfile');
    }
  }, [setActiveTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem('activeTab', tabKey); // Save active tab to localStorage
  };

  return (
    <div className="w-full">
      {/* Mobile: Horizontal Scrollable Tabs */}
      <div className="md:hidden mb-4 flex overflow-x-auto gap-3 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap text-sm font-medium
              ${activeTab === tab.key
                ? 'font-semibold'
                : 'hover:bg-white/20'
              }`}
            style={{
              backgroundColor: activeTab === tab.key ? accent : '#ffffff1a',
              color: activeTab === tab.key ? '#fff' : '#fff',
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
      <div className="hidden md:flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`text-left px-4 py-5 rounded-sm transition-all duration-200 font-medium
              ${activeTab === tab.key
                ? 'font-semibold'
                : 'hover:bg-white/20'
              }`}
            style={{
              backgroundColor: activeTab === tab.key ? accent : '#ffffff1a',
              color: activeTab === tab.key ? '#fff' : '#fff',
            }}
          //   style={{
          //     background: currentPage === index + 1 ? accent : '#d1d5dc',
          //     color: currentPage === index + 1 ? '#fff' : '#333',
          // }}
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
