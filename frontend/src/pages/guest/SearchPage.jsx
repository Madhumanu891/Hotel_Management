import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Search, MapPin, Calendar, Users, Star,
  Wifi, Dumbbell, Waves, Car, Coffee, SlidersHorizontal,
} from 'lucide-react';
import { useAvailableProperties } from '../../hooks/useProperties';
import Spinner from '../../components/ui/Spinner';

const amenityIcons = {
  wifi: Wifi, gym: Dumbbell, pool: Waves,
  parking: Car, restaurant: Coffee,
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
      />
    ))}
  </div>
);

const HotelCard = ({ property, onSelect }) => {
  const firstRoom = property.availableRoomTypes?.[0];
  const amenities = property.amenities?.slice(0, 4) || [];

  return (
    <div
      onClick={() => onSelect(property)}
      className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        {property.images?.[0]?.url ? (
          <img
            src={property.images[0].url}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-primary-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StarRating rating={property.starRating} />
        </div>
        {firstRoom?.availableCount && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {firstRoom.availableCount} rooms left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary-700 transition-colors">
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>{property.location?.city}, {property.location?.state}</span>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            {amenities.map(a => {
              const Icon = amenityIcons[a];
              return Icon ? (
                <div key={a} className="flex items-center gap-1 text-gray-400" title={a}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Price */}
        {/* Price — update existing */}
        {firstRoom && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                ₹{firstRoom.pricing?.totalAmount?.toLocaleString()}
              </span>
              <span className="text-gray-500 text-sm"> / stay</span>
              <div className="text-xs text-gray-400">
                ₹{firstRoom.basePrice?.toLocaleString()} + 18% GST
              </div>
            </div>
            <button className="btn-primary text-sm px-4 py-2 w-full sm:w-auto">
              Select
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      city: '',
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
    },
  });

  const { data, isLoading, isError } = useAvailableProperties(searchParams);

  const onSubmit = (formData) => {
    setSearchParams({
      city: formData.city,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: formData.adults,
      children: formData.children,
    });
  };

  const handleSelect = (property) => {
    // Store search context in sessionStorage for booking
    sessionStorage.setItem('searchParams', JSON.stringify(searchParams));
    sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate(`/dashboard/guest/hotels/${property.slug}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Stay</h1>
        <p className="text-gray-500 mt-1">Search from our collection of premium hotels</p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="label">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hyderabad, Mumbai..."
                  className="input pl-9"
                  {...register('city', { required: 'City is required' })}
                />
              </div>
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className="label">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  min={today}
                  className="input pl-9"
                  {...register('checkIn', { required: 'Required' })}
                />
              </div>
              {errors.checkIn && <p className="mt-1 text-xs text-red-600">{errors.checkIn.message}</p>}
            </div>

            <div>
              <label className="label">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  min={watch('checkIn') || today}
                  className="input pl-9"
                  {...register('checkOut', { required: 'Required' })}
                />
              </div>
              {errors.checkOut && <p className="mt-1 text-xs text-red-600">{errors.checkOut.message}</p>}
            </div>

            <div>
              <label className="label">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select className="input pl-9" {...register('adults')}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-500">Searching available hotels...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="card p-8 text-center">
          <p className="text-red-600 font-medium">Something went wrong. Please try again.</p>
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium">
              {data.properties?.length || 0} hotels available
              {searchParams?.city && ` in ${searchParams.city}`}
            </p>
          </div>

          {data.properties?.length === 0 ? (
            <div className="card p-12 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No hotels found</h3>
              <p className="text-gray-500">Try different dates or a different city</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.properties?.map(property => (
                <HotelCard
                  key={property._id}
                  property={property}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!searchParams && !isLoading && (
        <div className="card p-12 text-center">
          <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Search for hotels</h3>
          <p className="text-gray-500">Enter a city and dates to find available rooms</p>
        </div>
      )}
    </div>
  );
}