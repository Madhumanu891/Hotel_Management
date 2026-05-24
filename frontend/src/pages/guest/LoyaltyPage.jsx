import { Star, Award, Gift, Zap, ChevronRight, Check } from 'lucide-react';
import { useLoyalty, TIER_CONFIG } from '../../hooks/useLoyalty';
import { useMyBookings } from '../../hooks/useBookings';

const TierCard = ({ tierKey, config, isCurrentTier, isUnlocked, points }) => (
  <div className={`card p-5 relative overflow-hidden transition-all ${
    isCurrentTier
      ? 'ring-2 ring-primary-500 shadow-lg'
      : isUnlocked
      ? 'opacity-90'
      : 'opacity-50'
  }`}>
    {isCurrentTier && (
      <div className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        Current
      </div>
    )}

    {/* Tier gradient header */}
    <div className={`h-1.5 rounded-full bg-gradient-to-r ${config.gradient} mb-4`} />

    <div className="flex items-center gap-3 mb-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${config.bg} ${config.border} border`}>
        <Star className={`h-6 w-6 ${config.color} fill-current`} />
      </div>
      <div>
        <div className="font-bold text-gray-900 text-lg">{config.name}</div>
        <div className="text-sm text-gray-500">{config.minPoints}+ points</div>
      </div>
    </div>

    <div className="space-y-2">
      {config.perks.map((perk, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
            isUnlocked ? 'text-green-500' : 'text-gray-300'
          }`} />
          <span className={isUnlocked ? 'text-gray-700' : 'text-gray-400'}>{perk}</span>
        </div>
      ))}
    </div>
  </div>
);

const PointsHistoryRow = ({ booking }) => {
  const points = Math.round((booking.pricing?.basePrice || 0) / 10);
  const date   = new Date(booking.checkOutDate || booking.createdAt)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center">
          <Zap className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{booking.bookingRef}</div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-green-600">+{points} pts</div>
        <div className="text-xs text-gray-400">
          ₹{(booking.pricing?.basePrice || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default function LoyaltyPage() {
  const {
    points, tier, stays, currentTier,
    nextTier, nextTierConfig, progress,
    pointsToNext, TIER_CONFIG, tiers,
  } = useLoyalty();

  const { data: bookingsData } = useMyBookings({ status: 'checked_out', limit: 10 });
  const completedBookings = bookingsData?.bookings || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero card */}
      <div className={`rounded-2xl bg-gradient-to-br ${currentTier.gradient} p-6 text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/10 translate-y-8 -translate-x-8" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-white/80 text-sm">Your Tier</div>
              <div className="text-2xl font-bold">{currentTier.name} Member</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Points Balance', value: points.toLocaleString() },
              { label: 'Total Stays',    value: stays },
              { label: 'Points to Next', value: nextTier ? pointsToNext.toLocaleString() : '∞' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-white/70 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-sm text-white/80 mb-1.5">
                <span>{currentTier.name}</span>
                <span>{nextTierConfig?.name}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1.5 text-center">
                {pointsToNext} more points to reach {nextTierConfig?.name}
              </p>
            </div>
          )}

          {!nextTier && (
            <div className="text-center bg-white/20 rounded-xl py-3">
              <div className="font-semibold">🏆 Highest Tier Achieved!</div>
              <div className="text-white/70 text-sm">You are a Platinum member</div>
            </div>
          )}
        </div>
      </div>

      {/* How to earn points */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary-600" />
          How to Earn Points
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { action: 'Complete a stay',         points: '10 pts per ₹100',  icon: '🏨' },
            { action: 'Write a review',          points: '50 pts',           icon: '⭐' },
            { action: 'Refer a friend',          points: '200 pts',          icon: '👥' },
            { action: 'Book direct (no OTA)',    points: 'Bonus 5%',         icon: '📱' },
            { action: 'Weekday stay',            points: 'Extra 10 pts',     icon: '📅' },
            { action: 'Birthday month stay',     points: '2x points',        icon: '🎂' },
          ].map(({ action, points, icon }) => (
            <div key={action} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{action}</div>
              </div>
              <span className="text-sm font-bold text-primary-700">{points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All tiers */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary-600" />
          Membership Tiers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tiers.map(tierKey => (
            <TierCard
              key={tierKey}
              tierKey={tierKey}
              config={TIER_CONFIG[tierKey]}
              isCurrentTier={tierKey === tier}
              isUnlocked={tiers.indexOf(tierKey) <= tiers.indexOf(tier)}
              points={points}
            />
          ))}
        </div>
      </div>

      {/* Points history */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary-600" />
          Points History
        </h2>
        {completedBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Complete stays to earn points</p>
          </div>
        ) : (
          <div>
            {completedBookings.map(booking => (
              <PointsHistoryRow key={booking._id} booking={booking} />
            ))}
            <div className="mt-4 pt-4 border-t flex justify-between font-semibold text-gray-900">
              <span>Total Points Earned</span>
              <span className="text-primary-700">
                {completedBookings.reduce((s, b) =>
                  s + Math.round((b.pricing?.basePrice || 0) / 10), 0
                ).toLocaleString()} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Redeem points */}
      <div className="card p-6 border-primary-200 bg-primary-50">
        <h2 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Redeem Your Points
        </h2>
        <p className="text-sm text-primary-700 mb-4">
          Use your points for free nights, room upgrades, and dining discounts.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Free Night Stay',   cost: '500 pts', available: points >= 500  },
            { label: 'Room Upgrade',      cost: '300 pts', available: points >= 300  },
            { label: 'Dining Voucher',    cost: '150 pts', available: points >= 150  },
          ].map(({ label, cost, available }) => (
            <button
              key={label}
              disabled={!available}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                available
                  ? 'border-primary-300 bg-white hover:border-primary-500 hover:shadow-sm'
                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="font-semibold text-gray-900 text-sm mb-1">{label}</div>
              <div className="text-primary-600 font-bold text-lg">{cost}</div>
              {!available && (
                <div className="text-xs text-gray-400 mt-1">
                  Need {Number(cost.replace(' pts','')) - points} more points
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}