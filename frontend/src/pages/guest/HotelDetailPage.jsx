import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, Wifi, Dumbbell, Waves,
  Car, Coffee, UtensilsCrossed, Phone, Mail,
  Users, BedDouble, ChevronRight, Share2,
  Heart, Clock, Shield, CheckCircle,
} from 'lucide-react';
import { useProperty, useRoomTypes } from '../../hooks/useProperties';
import ReviewsSection from '../../components/reviews/ReviewsSection';
import Spinner from '../../components/ui/Spinner';
import Button  from '../../components/ui/Button';

const amenityMap = {
  wifi:       { icon: Wifi,           label: 'Free Wi-Fi'     },
  pool:       { icon: Waves,          label: 'Swimming Pool'  },
  gym:        { icon: Dumbbell,       label: 'Fitness Center' },
  parking:    { icon: Car,            label: 'Free Parking'   },
  restaurant: { icon: UtensilsCrossed,label: 'Restaurant'     },
  bar:        { icon: Coffee,         label: 'Bar & Lounge'   },
  spa:        { icon: Shield,         label: 'Spa'            },
};

// ── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ images, name }) => {
  const [active, setActive] = useState(0);
  const imgs = images?.length > 0 ? images : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-64 sm:h-80 rounded-2xl overflow-hidden">
      {/* Main image */}
      <div className="lg:col-span-2 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
        {imgs[active]?.url ? (
          <img
            src={imgs[active].url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-16 w-16 text-gray-300 dark:text-slate-600" />
          </div>
        )}
      </div>

      {/* Thumbnail grid */}
      <div className="hidden lg:grid grid-rows-2 gap-2">
        {[1, 2].map(i => (
          <div
            key={i}
            onClick={() => setActive(i)}
            className={`bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer transition-opacity ${
              active === i ? 'ring-2 ring-primary-500' : 'hover:opacity-90'
            }`}
          >
            {imgs[i]?.url ? (
              <img
                src={imgs[i].url}
                alt={`${name} ${i}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-gray-300 dark:text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile dots */}
      {imgs.length > 1 && (
        <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {imgs.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                active === i
                  ? 'w-4 bg-white'
                  : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Room Card ─────────────────────────────────────────────────────────────────
const RoomCard = ({ room, nights, onBook }) => {
  const total = room.basePrice * nights;
  const tax   = Math.round(total * 0.18);
  const grand = total + tax;

  return (
    <div className="card dark:bg-slate-800 p-5 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        {/* Room details */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-3 line-clamp-2">
              {room.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400 mb-3">
            {room.bedConfiguration && (
              <div className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" />
                {room.bedConfiguration}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Up to {room.maxOccupancy} guests
            </div>
            {room.size && (
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                {room.size} sq ft
              </div>
            )}
          </div>

          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.map(a => (
                <span
                  key={a}
                  className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2.5 py-1 rounded-full"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-2 md:min-w-36">
          <div className="text-right">
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              ₹{grand.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400">
              ₹{room.basePrice.toLocaleString()} × {nights}
              {nights > 1 ? ' nights' : ' night'} + GST
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
              Includes 18% GST
            </div>
          </div>
          <Button
            onClick={() => onBook({ ...room, calculatedTotal: grand, nights })}
            className="whitespace-nowrap"
          >
            Book Now
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HotelDetailPage() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const [saved, setSaved] = useState(false);

  const searchParams = (() => {
    try { return JSON.parse(sessionStorage.getItem('searchParams') || '{}'); }
    catch { return {}; }
  })();

  const { data: property, isLoading } = useProperty(slug);
  const { data: roomTypes }           = useRoomTypes(property?._id);

  const nights = searchParams.checkIn && searchParams.checkOut
    ? Math.ceil(
        (new Date(searchParams.checkOut) - new Date(searchParams.checkIn))
        / (1000 * 60 * 60 * 24)
      )
    : 1;

  const handleBookNow = (roomType) => {
    sessionStorage.setItem('selectedRoomType', JSON.stringify({
      _id:          roomType._id,
      name:         roomType.name,
      basePrice:    roomType.basePrice,
      maxOccupancy: roomType.maxOccupancy,
      nights,
    }));
    sessionStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate('/dashboard/guest/book');
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!property) {
    return (
      <div className="card dark:bg-slate-800 p-8 text-center">
        <p className="text-gray-500 dark:text-slate-400">Property not found</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to results
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-xl border transition-all ${
              saved
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500'
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => {
              navigator.share?.({
                title: property.name,
                url:   window.location.href,
              }).catch(() => {});
            }}
            className="p-2 rounded-xl border bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-primary-600"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="relative">
        <ImageGallery images={property.images} name={property.name} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= property.starRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200 dark:text-slate-600 fill-gray-200 dark:fill-slate-600'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-500 dark:text-slate-400 ml-1">
                {property.starRating}-Star Hotel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {property.name}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                {property.location?.address}, {property.location?.city},{' '}
                {property.location?.state}
              </span>
            </div>
          </div>

          {/* About */}
          {property.description && (
            <div className="card dark:bg-slate-800 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                About This Property
              </h2>
              <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="card dark:bg-slate-800 p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map(a => {
                  const info = amenityMap[a];
                  if (!info) return null;
                  const Icon = info.icon;
                  return (
                    <div key={a} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary-700 dark:text-primary-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Policies */}
          <div className="card dark:bg-slate-800 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Hotel Policies
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                {
                  icon:  Clock,
                  label: 'Check-in',
                  value: `After ${property.policies?.checkInTime || '14:00'}`,
                },
                {
                  icon:  Clock,
                  label: 'Check-out',
                  value: `Before ${property.policies?.checkOutTime || '11:00'}`,
                },
                {
                  icon:  CheckCircle,
                  label: 'Pets',
                  value: property.policies?.petsAllowed ? '✓ Allowed' : '✗ Not allowed',
                },
                {
                  icon:  CheckCircle,
                  label: 'Smoking',
                  value: property.policies?.smokingAllowed ? '✓ Allowed' : '✗ Not allowed',
                },
                {
                  icon:  Shield,
                  label: 'Cancellation',
                  value: `Free until ${property.policies?.cancellationHours || 24}h before`,
                },
                {
                  icon:  BedDouble,
                  label: 'Extra Bed',
                  value: property.policies?.extraBedAvailable ? '✓ Available' : '✗ Not available',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
                >
                  <Icon className="h-4 w-4 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-500 dark:text-slate-400 text-xs mb-0.5">
                      {label}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-xs">
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — sticky sidebar */}
        <div className="space-y-4">
          {/* Search summary */}
          {searchParams.checkIn && (
            <div className="card dark:bg-slate-800 p-5 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10">
              <h3 className="font-semibold text-primary-900 dark:text-primary-300 mb-3 text-sm">
                Your Search
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Check-in',  value: searchParams.checkIn  },
                  { label: 'Check-out', value: searchParams.checkOut },
                  { label: 'Duration',  value: `${nights} night${nights > 1 ? 's' : ''}` },
                  { label: 'Guests',    value: `${searchParams.adults || 1} adult${searchParams.adults > 1 ? 's' : ''}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-primary-600 dark:text-primary-400">{label}</span>
                    <span className="font-semibold text-primary-900 dark:text-primary-200">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {(property.contactInfo?.phone || property.contactInfo?.email) && (
            <div className="card dark:bg-slate-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                Contact Hotel
              </h3>
              <div className="space-y-2.5">
                {property.contactInfo?.phone && (
                  
                   <a href={`tel:${property.contactInfo.phone}`}
                    className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    {property.contactInfo.phone}
                  </a>
                )}
                {property.contactInfo?.email && (
                  
                   <a href={`mailto:${property.contactInfo.email}`}
                    className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-primary-600 flex-shrink-0" />
                    {property.contactInfo.email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Room Types */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Available Room Types
        </h2>
        {!roomTypes ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : roomTypes.length === 0 ? (
          <div className="card dark:bg-slate-800 p-8 text-center">
            <BedDouble className="h-10 w-10 text-gray-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-400">
              No rooms available for your selected dates
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-sm text-primary-700 dark:text-primary-400 font-medium hover:underline"
            >
              Try different dates
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {roomTypes.map(room => (
              <RoomCard
                key={room._id}
                room={room}
                nights={nights}
                onBook={handleBookNow}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <ReviewsSection
        propertyId={property._id}
        propertyName={property.name}
        userBookingId={null}
      />
    </div>
  );
}