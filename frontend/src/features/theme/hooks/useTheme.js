import { useSelector, useDispatch } from 'react-redux';
import { setTheme, toggleTheme } from '../theme.slice.js';
import { THEMES } from '../../../constants/theme.js';

export const useTheme = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return {
    mode,
    isDark: mode === THEMES.DARK,
    isLight: mode === THEMES.LIGHT,
    isSystem: mode === THEMES.SYSTEM,
    setMode: (newMode) => dispatch(setTheme(newMode)),
    toggle: () => dispatch(toggleTheme()),
    THEMES,
  };
};

export default useTheme;
