import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Camera, Shield, Bell, LogOut, CheckCircle,
  Star, Calendar, MapPin,
} from 'lucide-react';
import { useMe, useLogout } from '../../hooks/useAuth';
import { useUpdateProfile, useChangePassword } from '../../hooks/useProfile';
import { useAuthStore } from '../../stores/authStore';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LanguageSelector from '../../components/ui/LanguageSelector';

// ── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 'lg' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-20 w-20 text-2xl',
  };
  const initials = (name || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

// ── Tier Badge ───────────────────────────────────────────────────────────────
const TierBadge = ({ tier }) => {
  const config = {
    bronze: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Bronze' },
    silver: { color: 'bg-gray-100 text-gray-600 border-gray-300', label: 'Silver' },
    gold: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Gold' },
    platinum: { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Platinum' },
  };
  const t = config[tier] || config.bronze;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${t.color}`}>
      <Star className="h-3.5 w-3.5" />
      {t.label} Member
    </span>
  );
};

// ── Profile Form ─────────────────────────────────────────────────────────────
const ProfileForm = ({ user }) => {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.guestProfile?.phone || user?.staffProfile?.phone || '',
    },
  });
  const updateMutation = useUpdateProfile();

  const onSubmit = (data) => updateMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="label">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className={`input pl-9 ${errors.name ? 'input-error' : ''}`}
            placeholder="Your full name"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Min 2 characters' },
            })}
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="input pl-9 bg-gray-50 cursor-not-allowed"
            value={user?.email || ''}
            disabled
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
      </div>

      <div>
        <label className="label">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            className="input pl-9"
            placeholder="+91 98765 43210"
            {...register('phone')}
          />
        </div>
      </div>

      <Button
        type="submit"
        loading={updateMutation.isPending}
        disabled={!isDirty}
        className="w-full py-2.5"
      >
        Save Changes
      </Button>
    </form>
  );
};

// ── Change Password Form ─────────────────────────────────────────────────────
const ChangePasswordForm = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const changePwMutation = useChangePassword();

  const onSubmit = async (data) => {
    await changePwMutation.mutateAsync(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="label">Current Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showCurrent ? 'text' : 'password'}
            className={`input pl-9 pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
            placeholder="Your current password"
            {...register('currentPassword', { required: 'Current password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="label">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showNew ? 'text' : 'password'}
            className={`input pl-9 pr-10 ${errors.newPassword ? 'input-error' : ''}`}
            placeholder="Create a strong password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Min 8 characters' },
              pattern: {
                value: /(?=.*[A-Z])(?=.*\d)/,
                message: 'Must contain uppercase and number',
              },
              validate: (v) =>
                v !== watch('currentPassword') || 'New password must differ from current',
            })}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
        )}
      </div>

      <div>
        <label className="label">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="password"
            className={`input pl-9 ${errors.confirm ? 'input-error' : ''}`}
            placeholder="Repeat your new password"
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === watch('newPassword') || 'Passwords do not match',
            })}
          />
        </div>
        {errors.confirm && (
          <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>
        )}
      </div>

      {changePwMutation.isError && (
        <Alert
          type="error"
          message={changePwMutation.error?.response?.data?.message || 'Password change failed'}
        />
      )}

      <Button
        type="submit"
        loading={changePwMutation.isPending}
        className="w-full py-2.5"
      >
        <Shield className="h-4 w-4" />
        Update Password
      </Button>
    </form>
  );
};

// ── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: me, isLoading } = useMe();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState('profile');

  const profile = me || user;

  const tierPoints = profile?.guestProfile?.loyaltyPoints || 0;
  const tier = profile?.guestProfile?.loyaltyTier || 'bronze';
  const tierMax = { bronze: 500, silver: 1000, gold: 2000, platinum: 2000 };
  const progress = Math.min((tierPoints / tierMax[tier]) * 100, 100);

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'account', label: 'Account', icon: Bell },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Profile header card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={profile?.name || profile?.email} size="lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {profile?.name || 'User'}
            </h1>
            <p className="text-gray-500 text-sm truncate">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="badge-info capitalize">
                {profile?.role?.replace('_', ' ')}
              </span>
              {profile?.role === 'guest' && (
                <TierBadge tier={tier} />
              )}
              {profile?.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Loyalty progress for guests */}
        {profile?.role === 'guest' && (
          <div className="mt-5 pt-5 border-t">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Loyalty Points</span>
              <span className="font-semibold text-gray-900">{tierPoints} pts</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.max(0, tierMax[tier] - tierPoints)} points to next tier
            </p>
          </div>
        )}

        {/* Staff info */}
        {profile?.role !== 'guest' && profile?.staffProfile && (
          <div className="mt-5 pt-5 border-t grid grid-cols-2 gap-4 text-sm">
            {profile.staffProfile.employeeId && (
              <div>
                <span className="text-gray-500">Employee ID: </span>
                <span className="font-medium">{profile.staffProfile.employeeId}</span>
              </div>
            )}
            {profile.staffProfile.department && (
              <div>
                <span className="text-gray-500">Department: </span>
                <span className="font-medium capitalize">{profile.staffProfile.department}</span>
              </div>
            )}
            {profile.staffProfile.designation && (
              <div>
                <span className="text-gray-500">Designation: </span>
                <span className="font-medium">{profile.staffProfile.designation}</span>
              </div>
            )}
            {profile.propertyId && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500 text-xs">Property assigned</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
          <ProfileForm user={profile} />
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Change Password</h2>
            <p className="text-sm text-gray-500 mb-5">
              Use a strong password with uppercase, numbers and symbols
            </p>
            <ChangePasswordForm />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Account Security</h2>
            <div className="space-y-3 mt-4">
              {[
                { label: 'Two-factor authentication', status: 'Not enabled', action: 'Enable' },
                { label: 'Login notifications', status: 'Enabled', action: 'Disable' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.status}</div>
                  </div>
                  <button className="text-sm text-primary-700 font-medium hover:text-primary-800">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account tab */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b dark:border-slate-700">
                <span className="text-gray-500">Member since</span>
                <span className="font-medium text-gray-900">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-slate-700">
                <span className="text-gray-500">Account status</span>
                <span className={`font-medium ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {profile?.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900 capitalize">
                  {profile?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
              Appearance
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Choose your preferred theme
            </p>
            <ThemeToggle />
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Language</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Choose your preferred language
            </p>
            <LanguageSelector />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Sign Out</h2>
            <p className="text-sm text-gray-500 mb-4">
              Sign out from all devices and clear your session
            </p>
            <Button
              variant="danger"
              loading={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="w-full py-2.5"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="card p-6 border-red-200">
            <h2 className="font-semibold text-red-700 mb-1">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Once you delete your account, all your data will be permanently removed
            </p>
            <button className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
              Request Account Deletion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}