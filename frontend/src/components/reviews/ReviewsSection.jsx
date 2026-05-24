import { useState } from 'react';
import { Star, ChevronDown, PenLine, MessageSquare } from 'lucide-react';
import { usePropertyReviews } from '../../hooks/useReviews';
import { useAuthStore } from '../../stores/authStore';
import ReviewCard       from './ReviewCard';
import WriteReviewModal from './WriteReviewModal';
import Spinner          from '../ui/Spinner';

const RatingBar = ({ label, value, count, total }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-gray-600 w-8">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2">
      <div
        className="bg-yellow-400 h-2 rounded-full transition-all"
        style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
      />
    </div>
    <span className="text-gray-400 text-xs w-8">{count}</span>
  </div>
);

export default function ReviewsSection({ propertyId, propertyName, userBookingId }) {
  const { user } = useAuthStore();
  const [showAll,    setShowAll]    = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [sortBy,     setSortBy]     = useState('recent');

  const { data, isLoading } = usePropertyReviews(propertyId);

  const reviews = data?.reviews || [];
  const stats   = data?.stats   || {};

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'recent')  return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest')  return a.rating - b.rating;
    return 0;
  });

  const displayed = showAll ? sorted : sorted.slice(0, 3);

  const ratingCounts = [5,4,3,2,1].map(r => ({
    label: r,
    count: reviews.filter(rev => Math.round(rev.rating) === r).length,
  }));

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary-600" />
          Guest Reviews
          {reviews.length > 0 && (
            <span className="text-base font-normal text-gray-400">
              ({reviews.length})
            </span>
          )}
        </h2>

        {user?.role === 'guest' && userBookingId && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            <PenLine className="h-4 w-4" />
            Write Review
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <div className="card p-8 text-center">
          <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="font-medium text-gray-700 mb-1">No reviews yet</p>
          <p className="text-sm text-gray-400">Be the first to share your experience!</p>
          {user?.role === 'guest' && userBookingId && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-4 text-sm"
            >
              Write First Review
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Rating summary */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Average score */}
              <div className="text-center sm:border-r sm:pr-6">
                <div className="text-5xl font-bold text-gray-900">{avgRating}</div>
                <div className="flex justify-center my-2">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(Number(avgRating))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200 fill-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500">{reviews.length} reviews</div>
              </div>

              {/* Rating breakdown */}
              <div className="flex-1 space-y-2">
                {ratingCounts.map(({ label, count }) => (
                  <RatingBar
                    key={label}
                    label={label}
                    count={count}
                    total={reviews.length}
                    value={(count / reviews.length) * 100}
                  />
                ))}
              </div>
            </div>

            {/* Category averages */}
            {stats.categories && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t">
                {Object.entries(stats.categories).map(([cat, avg]) => (
                  <div key={cat} className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {Number(avg).toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{cat}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort control */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {displayed.length} of {reviews.length}</p>
            <select
              className="text-sm border rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>

          {/* Review list */}
          <div className="space-y-4">
            {displayed.map(review => (
              <ReviewCard key={review._id || review.id} review={review} />
            ))}
          </div>

          {/* Show more */}
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
              {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </button>
          )}
        </>
      )}

      {/* Mock reviews for demo when no real data */}
      {reviews.length === 0 && (
        <div className="space-y-4 opacity-60">
          <p className="text-xs text-center text-gray-400 font-medium uppercase tracking-wide">
            Sample Reviews
          </p>
          {[
            {
              id: '1', guestName: 'Priya S.', rating: 5,
              title: 'Absolutely wonderful stay!',
              comment: 'The rooms were spotless and the staff was incredibly helpful. Loved the pool and spa. Will definitely come back!',
              createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
              stayType: 'Leisure',
              helpfulCount: 12,
            },
            {
              id: '2', guestName: 'Rahul M.', rating: 4,
              title: 'Great location, excellent service',
              comment: 'Business trip and everything was perfect. Fast check-in, comfortable bed, good breakfast. Minor issue with AC but resolved quickly.',
              createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
              stayType: 'Business',
              helpfulCount: 8,
            },
          ].map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Write review modal */}
      {showModal && (
        <WriteReviewModal
          propertyId={propertyId}
          propertyName={propertyName}
          bookingId={userBookingId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}