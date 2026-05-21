import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Wifi, Dumbbell, Waves, Car, Coffee,
  UtensilsCrossed, Phone, Mail, ArrowLeft, Users, Bed,
  ChevronRight,
} from 'lucide-react';
import { useProperty, useRoomTypes } from '../../hooks/useProperties';
import Spinner from '../../components/ui/Spinner';

const amenityMap = {
  wifi:        { icon: Wifi,            label: 'Free Wi-Fi' },
  pool:        { icon: Waves,           label: 'Swimming Pool' },
  gym:         { icon: Dumbbell,        label: 'Fitness Center' },
  parking:     { icon: Car,             label: 'Free Parking' },
  restaurant:  { icon: UtensilsCrossed, label: 'Restaurant' },
  bar:         { icon: Coffee,          label: 'Bar & Lounge' },
};

export default function HotelDetailPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);

  const searchParams  = JSON.parse(sessionStorage.getItem('searchParams') || '{}');
  const { data: property, isLoading } = useProperty(slug);
  const { data: roomTypes } = useRoomTypes(property?._id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  const images = property.images || [];

  const handleBookNow = (roomType) => {
    sessionStorage.setItem('selectedRoomType', JSON.stringify(roomType));
    sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate('/dashboard/guest/book');
  };

  const nights = searchParams.checkIn && searchParams.checkOut
    ? Math.ceil(
        (new Date(searchParams.checkOut) - new Date(searchParams.checkIn))
        / (1000 * 60 * 60 * 24)
      )
    : 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to results
      </button>

      {/* Image gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-80">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden bg-gray-100">
          {images[imgIdx]?.url ? (
            <img
              src={images[imgIdx].url}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
        <div className="hidden lg:grid grid-rows-2 gap-3">
          {images.slice(1, 3).map((img, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => setImgIdx(i + 1)}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </div>
          ))}
          {images.length < 3 && (
            <div className="rounded-2xl bg-gray-100 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Hotel info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i <= property.starRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
              <span className="text-gray-500 text-sm">{property.starRating}-Star Hotel</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{property.location?.address}, {property.location?.city}, {property.location?.state}</span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">About this property</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map(a => {
                  const amenity = amenityMap[a];
                  if (!amenity) return null;
                  const Icon = amenity.icon;
                  return (
                    <div key={a} className="flex items-center gap-3 text-gray-600">
                      <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary-700" />
                      </div>
                      <span className="text-sm font-medium">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Policies */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Policies</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Check-in',    value: property.policies?.checkInTime    || '14:00' },
                { label: 'Check-out',   value: property.policies?.checkOutTime   || '11:00' },
                { label: 'Pets',        value: property.policies?.petsAllowed    ? 'Allowed' : 'Not allowed' },
                { label: 'Smoking',     value: property.policies?.smokingAllowed ? 'Allowed' : 'Not allowed' },
              ].map(p => (
                <div key={p.label}>
                  <span className="text-gray-500">{p.label}: </span>
                  <span className="font-medium text-gray-900">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Contact & search summary */}
        <div className="space-y-4">
          {/* Search summary */}
          {searchParams.checkIn && (
            <div className="card p-5 border-primary-200 bg-primary-50">
              <h3 className="font-semibold text-primary-900 mb-3">Your Search</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-700">Check-in</span>
                  <span className="font-medium text-primary-900">{searchParams.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Check-out</span>
                  <span className="font-medium text-primary-900">{searchParams.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Duration</span>
                  <span className="font-medium text-primary-900">{nights} night{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-700">Guests</span>
                  <span className="font-medium text-primary-900">{searchParams.adults} adult{searchParams.adults > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          {(property.contactInfo?.phone || property.contactInfo?.email) && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <div className="space-y-2">
                {property.contactInfo?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{property.contactInfo.phone}</span>
                  </div>
                )}
                {property.contactInfo?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{property.contactInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Types */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Rooms</h2>
        {!roomTypes ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : roomTypes.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">No rooms available for your selected dates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roomTypes.map(room => {
              const pricePerNight = room.basePrice;
              const totalPrice    = pricePerNight * nights;
              const tax           = Math.round(totalPrice * 0.18);
              const grandTotal    = totalPrice + tax;

              return (
                <div key={room._id} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Room info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{room.name}</h3>
                      {room.description && (
                        <p className="text-gray-500 text-sm mb-3">{room.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {room.bedConfiguration && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            <span>{room.bedConfiguration}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Up to {room.maxOccupancy} guests</span>
                        </div>
                        {room.size && (
                          <span>{room.size} sq ft</span>
                        )}
                      </div>
                      {room.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {room.amenities.map(a => (
                            <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing + CTA */}
                    <div className="flex flex-col items-end gap-3 min-w-fit">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{grandTotal.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''} + tax
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Includes 18% GST
                        </div>
                      </div>
                      <button
                        onClick={() => handleBookNow({ ...room, calculatedTotal: grandTotal, nights })}
                        className="btn-primary flex items-center gap-2"
                      >
                        Book Now
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}