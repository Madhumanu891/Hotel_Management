import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Hotel, Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-700 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">NexoraHotels</span>
        </div>

        {/* 404 illustration */}
        <div className="text-8xl font-black text-primary-100 dark:text-primary-900 mb-4 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            to="/dashboard/guest/search"
            className="btn-secondary flex items-center justify-center gap-2 py-3 px-6"
          >
            <Search className="h-4 w-4" />
            Search Hotels
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 mx-auto transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    </div>
  );
}