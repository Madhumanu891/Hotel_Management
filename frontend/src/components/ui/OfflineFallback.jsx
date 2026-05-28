import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineFallback({ onRetry }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">You are offline</h2>
        <p className="text-gray-500 text-sm mb-6">
          Check your internet connection and try again. Some features may still work from cache.
        </p>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="btn-primary flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}