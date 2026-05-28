import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు',   flag: '🇮🇳' },
];

export default function LanguageSelector({ compact = false }) {
  const { i18n } = useTranslation();
  const current  = languages.find(l => l.code === i18n.language) || languages[0];

  if (compact) {
    return (
      <div className="relative group">
        <button className="flex items-center gap-1.5 p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:block">{current.flag}</span>
        </button>
        <div className="absolute right-0 top-10 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-lg py-1 hidden group-hover:block z-50 min-w-32">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                i18n.language === lang.code
                  ? 'text-primary-700 font-semibold'
                  : 'text-gray-700 dark:text-slate-300'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="label">Language</label>
      <div className="grid grid-cols-3 gap-2">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm ${
              i18n.language === lang.code
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700'
                : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 text-gray-600 dark:text-slate-400'
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="font-medium text-xs">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}