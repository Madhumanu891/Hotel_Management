import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import { useCreateBooking } from '../../hooks/useBookings';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function BookingPage() {
  const navigate   = useNavigate();
  const property   = JSON.parse(sessionStorage.getItem('selectedProperty') || 'null');
  const roomType   = JSON.parse(sessionStorage.getItem('selectedRoomType') || 'null');
  const params     = JSON.parse(sessionStorage.getItem('searchParams') || '{}');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      adults:   params.adults   || 1,
      children: params.children || 0,
    },
  });

  const createBookingMutation = useCreateBooking();

  if (!property || !roomType) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="font-medium text-gray-900 mb-2">No room selected</p>
        <button onClick={() => navigate('/dashboard/guest/search')} className="btn-primary mt-4">
          Search Hotels
        </button>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      const booking = await createBookingMutation.mutateAsync({
        propertyId:      property._id,
        roomTypeId:      roomType._id,
        checkInDate:     params.checkIn,
        checkOutDate:    params.checkOut,
        adults:          Number(data.adults),
        children:        Number(data.children),
        specialRequests: data.specialRequests,
      });

      sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
      navigate('/dashboard/guest/payment');
    } catch (err) {
      // Error handled by mutation state
    }
  };

  const nights     = roomType.nights || 1;
  const basePrice  = roomType.basePrice * nights;
  const tax        = Math.round(basePrice * 0.18);
  const total      = basePrice + tax;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Booking</h1>
        <p className="text-gray-500 mt-1">Review details and confirm your reservation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking summary */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-4 w-4 text-primary-600" />
                <span><strong>{property.name}</strong> — {property.location?.city}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-4 w-4 text-primary-600" />
                <span>{params.checkIn} → {params.checkOut} ({nights} night{nights > 1 ? 's' : ''})</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-4 w-4 text-primary-600" />
                <span>{roomType.name} — up to {roomType.maxOccupancy} guests</span>
              </div>
            </div>
          </div>

          {/* Guest details form */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Guest Details</h2>

            {createBookingMutation.isError && (
              <div className="mb-4">
                <Alert
                  type="error"
                  message={createBookingMutation.error?.response?.data?.message || 'Booking failed. Please try again.'}
                />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Adults</label>
                  <select className="input" {...register('adults', { required: true })}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Children</label>
                  <select className="input" {...register('children')}>
                    {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Special Requests (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Late check-in, dietary requirements, room preferences..."
                  className="input resize-none"
                  {...register('specialRequests')}
                />
              </div>

              {/* Cancellation policy */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Free cancellation</strong> up to 24 hours before check-in. After that, 50% refund applies.
              </div>

              <Button
                type="submit"
                loading={createBookingMutation.isPending}
                className="w-full py-3 text-base"
              >
                Confirm Booking — ₹{total.toLocaleString()}
              </Button>
            </form>
          </div>
        </div>

        {/* Price breakdown */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Price Breakdown</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>₹{roomType.basePrice?.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>₹{basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              You will not be charged until payment is confirmed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}