import Spinner from './Spinner';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500 font-medium">{message}</p>
      </div>
    </div>
  );
}