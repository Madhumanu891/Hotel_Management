import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import { useForm } from 'react-hook-toast';
import { useForm } from 'react-hook-form';
import {
  Calendar, Users, BedDouble, MapPin,
  ChevronRight, AlertCircle, Tag,
} from 'lucide-react';
import { useCreateBooking } from '../../hooks/useBookings';
import { useAuthStore }     from '../../stores/authStore';
import Button  from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function BookingPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuthStore();

  // Get data passed from HotelDetailPage via navigation state OR sessionStorage
  const [searchParams]  = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('searchParams') || 'null'); }
    catch { return null; }
  });
  const [selectedProperty] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('selectedProperty') || 'null'); }
    catch { return null; }
  });
  const [selectedRoomType] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('selectedRoomType') || 'null'); }
    catch { return null; }
  });

  const createBookingMutation = useCreateBooking();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      specialRequests: '',
      adults:   searchParams?.adults   || 1,
      children: searchParams?.children || 0,
    },
  });

  // Guard — if no data, redirect back to search
  useEffect(() => {
    if (!selectedProperty || !selectedRoomType || !searchParams) {
      navigate('/dashboard/guest/search');
    }
  }, []);

  if (!selectedProperty || !selectedRoomType || !searchParams) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const checkIn  = new Date(searchParams.checkIn);
  const checkOut = new Date(searchParams.checkOut);
  const nights   = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const basePrice    = selectedRoomType.basePrice || 0;
  const taxAmount    = Math.round(basePrice * nights * 0.18);
  const totalAmount  = (basePrice * nights) + taxAmount;

  const onSubmit = async (formData) => {
    try {
      const bookingPayload = {
        propertyId:      selectedProperty._id,
        roomTypeId:      selectedRoomType._id,
        checkInDate:     searchParams.checkIn,
        checkOutDate:    searchParams.checkOut,
        adults:          Number(formData.adults),
        children:        Number(formData.children),
        specialRequests: formData.specialRequests || '',
        pricing: {
          basePrice:   basePrice * nights,
          taxAmount,
          totalAmount,
        },
      };

      const booking = await createBookingMutation.mutateAsync(bookingPayload);

      // Store booking for payment page
      sessionStorage.setItem('currentBooking', JSON.stringify(booking));

      // Navigate to payment page
      navigate('/dashboard/guest/payment');

    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Complete Your Booking
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Review your details before confirming
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Booking form */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Guest Details
            </h2>

            <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Adults</label>
                  <select className="input" {...register('adults')}>
                    {[1,2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Children</label>
                  <select className="input" {...register('children')}>
                    {[0,1,2,3,4].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Special Requests (optional)</label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Early check-in, high floor, extra pillows..."
                  {...register('specialRequests')}
                />
              </div>
            </form>
          </div>

          {/* Cancellation policy */}
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  Free Cancellation
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Cancel up to 24 hours before check-in for a full refund.
                  After that, 1 night will be charged.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 sticky top-24">
            {/* Property */}
            <div className="flex items-start gap-3 mb-5 pb-5 border-b dark:border-slate-700">
              <div className="h-14 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {selectedProperty.images?.[0]?.url ? (
                  <img
                    src={selectedProperty.images[0].url}
                    alt={selectedProperty.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {selectedProperty.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {selectedProperty.location?.city}, {selectedProperty.location?.state}
                </div>
                <div className="text-xs text-primary-600 font-medium mt-1">
                  {selectedRoomType.name}
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Check-in
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {checkIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Check-out
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {checkOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                  <BedDouble className="h-4 w-4" />
                  Duration
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {nights} night{nights > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm border-t dark:border-slate-700 pt-4 mb-5">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>₹{basePrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>₹{(basePrice * nights).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>GST (18%)</span>
                <span>₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t dark:border-slate-700">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <Button
              form="booking-form"
              type="submit"
              loading={createBookingMutation.isPending}
              className="w-full py-3 text-base"
            >
              Proceed to Payment
              <ChevronRight className="h-5 w-5" />
            </Button>

            <p className="text-xs text-center text-gray-400 dark:text-slate-500 mt-3">
              You will not be charged yet. Payment on next page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}``