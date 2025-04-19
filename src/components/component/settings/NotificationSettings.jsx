import { useEffect, useState } from 'react';

const defaultSettings = {
  accountActivity: true,
  investment: true,
  promotions: false,
};

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  const handleChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    alert('Notification preferences saved!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => handleChange(key)}
                className="accent-indigo-600 w-5 h-5"
              />
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-white hover:bg-white/80 transition-colors text-black py-2 px-4 rounded-lg font-medium"
      >
        Save Preferences
      </button>
    </div>
  );
};

export default NotificationSettings;
