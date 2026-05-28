import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useThemeStore();

  const options = [
    { key: 'light',  icon: Sun,     label: 'Light'  },
    { key: 'dark',   icon: Moon,    label: 'Dark'   },
    { key: 'system', icon: Monitor, label: 'System' },
  ];

  if (compact) {
    // Single toggle button — cycles through modes
    const current = options.find(o => o.key === theme) || options[0];
    const next    = options[(options.findIndex(o => o.key === theme) + 1) % options.length];
    const Icon    = current.icon;

    return (
      <button
        onClick={() => setTheme(next.key)}
        className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        title={`Switch to ${next.label} mode`}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
      {options.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            theme === key
              ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
          }`}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:block">{label}</span>
        </button>
      ))}
    </div>
  );
}