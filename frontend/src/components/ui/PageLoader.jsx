import Spinner from './Spinner';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <span className="text-white font-black text-xl">N</span>
        </div>
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}