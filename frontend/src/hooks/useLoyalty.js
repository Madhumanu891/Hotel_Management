import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';

const TIER_CONFIG = {
  bronze: {
    name:       'Bronze',
    color:      'text-orange-600',
    bg:         'bg-orange-50',
    border:     'border-orange-200',
    gradient:   'from-orange-400 to-orange-600',
    minPoints:  0,
    maxPoints:  499,
    perks: [
      'Free Wi-Fi on every stay',
      'Early check-in (subject to availability)',
      '10 points per ₹100 spent',
    ],
  },
  silver: {
    name:       'Silver',
    color:      'text-gray-600',
    bg:         'bg-gray-100',
    border:     'border-gray-300',
    gradient:   'from-gray-400 to-gray-600',
    minPoints:  500,
    maxPoints:  999,
    perks: [
      'All Bronze perks',
      'Late check-out until 1 PM',
      '15 points per ₹100 spent',
      'Complimentary newspaper',
    ],
  },
  gold: {
    name:       'Gold',
    color:      'text-yellow-600',
    bg:         'bg-yellow-50',
    border:     'border-yellow-200',
    gradient:   'from-yellow-400 to-yellow-600',
    minPoints:  1000,
    maxPoints:  1999,
    perks: [
      'All Silver perks',
      'Free breakfast for 2',
      '20 points per ₹100 spent',
      'Room upgrade on availability',
      'Dedicated support line',
    ],
  },
  platinum: {
    name:       'Platinum',
    color:      'text-purple-700',
    bg:         'bg-purple-50',
    border:     'border-purple-200',
    gradient:   'from-purple-500 to-purple-800',
    minPoints:  2000,
    maxPoints:  Infinity,
    perks: [
      'All Gold perks',
      'Suite upgrades when available',
      '25 points per ₹100 spent',
      'Airport transfer included',
      'Personal concierge',
      'Exclusive member events',
    ],
  },
};

export const useLoyalty = () => {
  const { user } = useAuthStore();

  const points = user?.guestProfile?.loyaltyPoints  || 0;
  const tier   = user?.guestProfile?.loyaltyTier    || 'bronze';
  const stays  = user?.guestProfile?.totalStays     || 0;

  const currentTier = TIER_CONFIG[tier] || TIER_CONFIG.bronze;

  const tiers     = ['bronze', 'silver', 'gold', 'platinum'];
  const tierIndex = tiers.indexOf(tier);
  const nextTier  = tierIndex < 3 ? tiers[tierIndex + 1] : null;
  const nextTierConfig = nextTier ? TIER_CONFIG[nextTier] : null;

  const progress = nextTierConfig
    ? Math.round(
        ((points - currentTier.minPoints) /
         (nextTierConfig.minPoints - currentTier.minPoints)) * 100
      )
    : 100;

  const pointsToNext = nextTierConfig
    ? Math.max(0, nextTierConfig.minPoints - points)
    : 0;

  return {
    points,
    tier,
    stays,
    currentTier,
    nextTier,
    nextTierConfig,
    progress: Math.min(100, Math.max(0, progress)),
    pointsToNext,
    TIER_CONFIG,
    tiers,
  };
};

export { TIER_CONFIG };