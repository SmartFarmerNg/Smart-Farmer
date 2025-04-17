import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const themes = ['light', 'dark'];
const accents = ['#05445E', '#0FA280', '#189AB4', '#75E6DA', '#3D550C', '#81B622', '#ECF87F', '#59981A'];

const AppearanceSettings = () => {
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState('#0FA280');
  const [glass, setGlass] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [status, setStatus] = useState('');

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  // Fetch appearance from Firestore
  useEffect(() => {
    const fetchAppearance = async () => {
      const localTheme = localStorage.getItem('theme');
      const localAccent = localStorage.getItem('accent');
      const localGlass = localStorage.getItem('glass');

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTheme(data.theme || localTheme || 'light');
          setAccent(data.accent || localAccent || '#0FA280');
          setGlass(data.glass !== undefined ? data.glass : localGlass === 'true');
        }
      } else {
        // Load from localStorage
        if (localTheme) setTheme(localTheme);
        if (localAccent) setAccent(localAccent);
        if (localGlass) setGlass(localGlass === 'true');
      }

      setInitialLoad(false);
    };

    fetchAppearance();
  }, [user]);

  // Apply preferences to DOM
  useEffect(() => {
    if (initialLoad) return;

    localStorage.setItem('theme', theme);
    localStorage.setItem('accent', accent);
    localStorage.setItem('glass', glass.toString());

  }, [theme, accent, glass, initialLoad]);

  const saveToFirestore = async () => {
    if (!user) {
      setStatus('Please log in to save your preferences.');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        theme,
        accent,
        glass,
      });

      setStatus('Preferences saved ✅');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error(error);
      setStatus('Error saving preferences ❌');
    }
  };

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
        <div className="flex gap-3 bg-white/10 p-3 rounded-lg text-white w-full">
          {accents.map((color) => (
            <button
              key={color}
              onClick={() => setAccent(color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${accent === color ? 'ring-2 ring-white' : ''}`}
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

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={saveToFirestore}
          className="bg-white hover:bg-white/80 transition-colors text-black px-4 py-2 rounded-lg"
        >
          Save Preferences
        </button>
        {status && <p className="text-sm text-white">{status}</p>}
      </div>
    </div>
  );
};

export default AppearanceSettings;
