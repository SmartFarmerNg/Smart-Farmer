import { useEffect, useState } from 'react';

const themes = ['system', 'light', 'dark'];
const accents = ['indigo', 'emerald', 'rose', 'cyan', 'amber'];

const AppearanceSettings = () => {
  const [theme, setTheme] = useState('system');
  const [accent, setAccent] = useState('indigo');
  const [glass, setGlass] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedAccent = localStorage.getItem('accent');
    const savedGlass = localStorage.getItem('glass');

    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccent(savedAccent);
    if (savedGlass) setGlass(savedGlass === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('accent', accent);
    localStorage.setItem('glass', glass.toString());

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent', accent);
  }, [theme, accent, glass]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Appearance Settings</h2>

      {/* Theme Picker */}
      <div>
        <label className="block mb-1 text-sm font-medium">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="bg-white/10 border border-white/10 p-3 rounded-lg text-white w-full"
        >
          {themes.map((option) => (
            <option key={option} value={option} className="text-black">
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Accent Color Picker */}
      <div>
        <label className="block mb-1 text-sm font-medium">Accent Color</label>
        <div className="flex gap-3">
          {accents.map((color) => (
            <button
              key={color}
              onClick={() => setAccent(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${accent === color ? 'ring-2 ring-white' : ''
                }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Glassmorphism Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={glass}
          onChange={() => setGlass((prev) => !prev)}
          id="glass-toggle"
          className="accent-indigo-600"
        />
        <label htmlFor="glass-toggle" className="text-sm font-medium">
          Enable Glassmorphism
        </label>
      </div>
    </div>
  );
};

export default AppearanceSettings;
