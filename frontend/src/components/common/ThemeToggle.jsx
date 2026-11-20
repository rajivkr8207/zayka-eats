import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../features/theme/theme.slice.js';
import { THEMES } from '../../constants/theme.js';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state) => state.theme.mode);

  return (
    <div className="flex items-center p-1 rounded-full bg-surface border border-border-subtle shadow-sm">
      <button
        type="button"
        onClick={() => dispatch(setTheme(THEMES.LIGHT))}
        className={`p-1.5 rounded-full transition-all duration-150 ${
          currentMode === THEMES.LIGHT
            ? 'bg-brand text-white shadow-sm'
            : 'text-text-muted hover:text-text-primary'
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <FiSun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => dispatch(setTheme(THEMES.DARK))}
        className={`p-1.5 rounded-full transition-all duration-150 ${
          currentMode === THEMES.DARK
            ? 'bg-brand text-white shadow-sm'
            : 'text-text-muted hover:text-text-primary'
        }`}
        title="Dark Mode (Default)"
        aria-label="Dark Mode"
      >
        <FiMoon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => dispatch(setTheme(THEMES.SYSTEM))}
        className={`p-1.5 rounded-full transition-all duration-150 ${
          currentMode === THEMES.SYSTEM
            ? 'bg-brand text-white shadow-sm'
            : 'text-text-muted hover:text-text-primary'
        }`}
        title="System Preference"
        aria-label="System Mode"
      >
        <FiMonitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ThemeToggle;
