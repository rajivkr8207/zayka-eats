import { createSlice } from '@reduxjs/toolkit';
import { THEMES, THEME_STORAGE_KEY } from '../../constants/theme.js';

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && [THEMES.DARK, THEMES.LIGHT, THEMES.SYSTEM].includes(saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return THEMES.DARK; // Dark mode is default per docs/theme.md
};

const applyThemeToDOM = (themeMode) => {
  const root = document.documentElement;
  let isDark = themeMode === THEMES.DARK;
  if (themeMode === THEMES.SYSTEM) {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
  },
  reducers: {
    setTheme: (state, action) => {
      const newMode = action.payload;
      state.mode = newMode;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch {
        // ignore
      }
      applyThemeToDOM(newMode);
    },
    toggleTheme: (state) => {
      const nextMode = state.mode === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      state.mode = nextMode;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextMode);
      } catch {
        // ignore
      }
      applyThemeToDOM(nextMode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
