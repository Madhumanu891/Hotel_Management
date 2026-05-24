import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSubmitReview } from '../../hooks/useReviews';
import StarInput from './StarInput';
import Button   from '../ui/Button';

const categories = ['cleanliness', 'service', 'location', 'value'];

export default function WriteReviewModal({ propertyId, propertyName, bookingId, onClose }) {
  const [overallRating,   setOverallRating]   = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 0, service: 0, location: 0, value: 0,
  });

  const { register, handleSubmit, formState: { errors } } = useForm();
  const submitMutation = useSubmitReview();

  const setCatRating = (cat, val) =>
    setCategoryRatings(prev => ({ ...prev, [cat]: val }));

  const onSubmit = async (data) => {
    if (overallRating === 0) return;
    await submitMutation.mutateAsync({
      propertyId,
      bookingId,
      rating:     overallRating,
      title:      data.title,
      comment:    data.comment,
      stayType:   data.stayType,
      categories: categoryRatings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-500 mt-0.5">{propertyName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Overall rating */}
          <div className="text-center py-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-3">Overall Rating</p>
            <StarInput value={overallRating} onChange={setOverallRating} size="lg" />
            {overallRating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'][overallRating]}
              </p>
            )}
            {overallRating === 0 && (
              <p className="text-xs text-red-500 mt-2">Please select a rating</p>
            )}
          </div>

          {/* Category ratings */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Rate by Category</p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 capitalize">{cat}</span>
                  <StarInput
                    value={categoryRatings[cat]}
                    onChange={(v) => setCatRating(cat, v)}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stay type */}
          <div>
            <label className="label">Type of Stay</label>
            <select className="input" {...register('stayType')}>
              <option value="">Select...</option>
              <option value="Business">Business</option>
              <option value="Leisure">Leisure</option>
              <option value="Family">Family</option>
              <option value="Couple">Couple</option>
              <option value="Solo">Solo</option>
            </select>
          </div>

          {/* Review title */}
          <div>
            <label className="label">Review Title</label>
            <input
              className={`input ${errors.title ? 'input-error' : ''}`}
              placeholder="Summarize your stay in one line"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="label">Your Review</label>
            <textarea
              rows={4}
              className={`input resize-none ${errors.comment ? 'input-error' : ''}`}
              placeholder="Share your experience — what did you love? What could be better?"
              {...register('comment', {
                required:  'Please write your review',
                minLength: { value: 20, message: 'Minimum 20 characters' },
              })}
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitMutation.isPending}
              disabled={overallRating === 0}
              className="flex-1"
            >
              <Star className="h-4 w-4" />
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}