import { Star, ThumbsUp, Flag } from 'lucide-react';

const StarDisplay = ({ rating, size = 'sm' }) => {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4' };
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`${sizes[size]} ${
            i <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 fill-gray-100'
          }`}
        />
      ))}
    </div>
  );
};

const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  if (days < 1)   return 'Today';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days/7)}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months/12)}y ago`;
};

export default function ReviewCard({ review }) {
  const initials = (review.guestName || 'G')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {review.guestName || 'Anonymous Guest'}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <StarDisplay rating={review.rating} />
                <span className="text-xs text-gray-400">
                  {timeAgo(review.createdAt)}
                </span>
              </div>
            </div>
            {review.stayType && (
              <span className="badge-info text-xs flex-shrink-0">
                {review.stayType}
              </span>
            )}
          </div>

          {/* Title */}
          {review.title && (
            <p className="font-medium text-gray-800 text-sm mt-2">
              "{review.title}"
            </p>
          )}

          {/* Body */}
          <p className="text-gray-600 text-sm mt-1 leading-relaxed">
            {review.comment}
          </p>

          {/* Category ratings */}
          {review.categories && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {Object.entries(review.categories).map(([cat, val]) => (
                <div key={cat} className="text-xs">
                  <div className="text-gray-400 capitalize mb-0.5">{cat}</div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full"
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-600 font-medium">{val}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}