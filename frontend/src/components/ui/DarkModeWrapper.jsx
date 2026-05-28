import { useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';

export default function DarkModeWrapper({ children }) {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return children;
}