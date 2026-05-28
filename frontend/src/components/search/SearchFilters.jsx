import { useState } from 'react';
import {
  SlidersHorizontal, X, Star, Wifi, Dumbbell,
  Waves, Car, Coffee, UtensilsCrossed, Flower2,
  ChevronDown, ChevronUp,
} from 'lucide-react';

const amenityOptions = [
  { key: 'wifi',        label: 'Free Wi-Fi',   icon: Wifi            },
  { key: 'pool',        label: 'Swimming Pool', icon: Waves           },
  { key: 'gym',         label: 'Fitness Center',icon: Dumbbell        },
  { key: 'spa',         label: 'Spa',           icon: Flower2             },
  { key: 'parking',     label: 'Free Parking',  icon: Car             },
  { key: 'restaurant',  label: 'Restaurant',    icon: UtensilsCrossed },
  { key: 'bar',         label: 'Bar',           icon: Coffee          },
];

const defaultFilters = {
  minRating:  0,
  maxPrice:   50000,
  amenities:  [],
  sortBy:     'rating',
};

export default function SearchFilters({ filters, onChange, resultCount }) {
  const [expanded, setExpanded] = useState(false);

  const active = filters.minRating > 0 ||
                 filters.maxPrice < 50000 ||
                 filters.amenities.length > 0;

  const toggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };

  const reset = () => onChange(defaultFilters);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 font-medium text-gray-700 hover:text-gray-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {active && (
            <span className="h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {[
                filters.minRating > 0,
                filters.maxPrice < 50000,
                filters.amenities.length > 0,
              ].filter(Boolean).length}
            </span>
          )}
          {expanded
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </button>

        <div className="flex items-center gap-3">
          {resultCount !== undefined && (
            <span className="text-sm text-gray-500">{resultCount} results</span>
          )}

          {/* Sort dropdown */}
          <select
            className="text-sm border rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.sortBy || 'rating'}
            onChange={e => onChange({ ...filters, sortBy: e.target.value })}
          >
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {active && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-5">
          {/* Star rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Minimum Star Rating
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => onChange({ ...filters, minRating: rating })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    filters.minRating === rating
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {rating === 0 ? (
                    'Any'
                  ) : (
                    <>
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {rating}+
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Max Price per Night
              </label>
              <span className="text-sm font-bold text-primary-700">
                ₹{filters.maxPrice?.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={filters.maxPrice || 50000}
              onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-700"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {amenityOptions.map(({ key, label, icon: Icon }) => {
                const selected = filters.amenities?.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      selected
                        ? 'bg-primary-50 border-primary-400 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}