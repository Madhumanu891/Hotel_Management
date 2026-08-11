import { Link, useNavigate } from 'react-router-dom';
import { Hotel, Home, Search, ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-700 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            NexoraHotels
          </span>
        </div>

        {/* 404 illustration */}
        <div className="relative mb-6">
          <div className="text-9xl font-black text-primary-100 dark:text-primary-900/50 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Compass className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved to a different URL.
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
          onClick={() => navigate(-1)}
          className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 mx-auto transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
      </div>
    </div>
  );
}