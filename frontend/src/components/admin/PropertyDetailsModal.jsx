import {
  X,
  MapPin,
  Star,
  Building2,
  Calendar,
} from 'lucide-react';

import Spinner from '../ui/Spinner';
import { usePropertyById } from '../../hooks/useAdmin';

export default function PropertyDetailsModal({
  propertyId,
  isOpen,
  onClose,
}) {
  const { data: property, isLoading } = usePropertyById(propertyId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Property Details
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : property ? (
          <div className="p-6 space-y-6">

            {/* Image */}
            {property.images?.[0]?.url && (
              <img
                src={property.images[0].url}
                alt=""
                className="w-full h-64 object-cover rounded-2xl"
              />
            )}

            {/* Name */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {property.name}
              </h3>

              <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-slate-400">
                <MapPin className="h-4 w-4" />
                {property.location?.address},
                {' '}
                {property.location?.city},
                {' '}
                {property.location?.state}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i <= property.starRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700">
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  Status
                </div>

                <div className="font-semibold mt-1">
                  {property.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700">
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  Created
                </div>

                <div className="font-semibold mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(property.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Amenities
              </h4>

              <div className="flex flex-wrap gap-2">
                {property.amenities?.map(a => (
                  <span
                    key={a}
                    className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-sm capitalize"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h4>

                <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">
            Property not found
          </div>
        )}
      </div>
    </div>
  );
}