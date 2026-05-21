import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Hotel, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRegister } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

const PasswordStrength = ({ password = '' }) => {
  const checks = [
    { label: '8+ characters',  ok: password.length >= 8 },
    { label: 'Uppercase',      ok: /[A-Z]/.test(password) },
    { label: 'Lowercase',      ok: /[a-z]/.test(password) },
    { label: 'Number',         ok: /\d/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1 text-xs ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-3 w-3" />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const registerMutation = useRegister();
  const password = watch('password', '');

  const onSubmit = (data) => registerMutation.mutate(data);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex-col justify-center p-12">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">NexoraHotels</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Join NexoraHotels<br />Loyalty Programme
        </h1>
        <p className="text-primary-200 text-lg mb-8">
          Earn points on every stay. Unlock exclusive benefits as you level up from Bronze to Platinum.
        </p>
        <div className="space-y-4">
          {[
            { tier: 'Bronze',   pts: '0 pts',    perk: 'Free Wi-Fi on every stay' },
            { tier: 'Silver',   pts: '500 pts',  perk: 'Early check-in priority' },
            { tier: 'Gold',     pts: '1000 pts', perk: 'Complimentary breakfast' },
            { tier: 'Platinum', pts: '2000 pts', perk: 'Suite upgrades available' },
          ].map(t => (
            <div key={t.tier} className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <div className="text-white font-bold w-20">{t.tier}</div>
              <div className="text-primary-200 text-sm flex-1">{t.perk}</div>
              <div className="text-primary-300 text-xs">{t.pts}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-primary-700 flex items-center justify-center">
              <Hotel className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl">NexoraHotels</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
          <p className="text-gray-500 mb-8">Join thousands of guests enjoying premium stays</p>

          {registerMutation.isError && (
            <div className="mb-6">
              <Alert
                type="error"
                message={registerMutation.error?.response?.data?.message || 'Registration failed.'}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                placeholder="Madhu Dhanaveni"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="input"
                {...register('phone')}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', {
                    required:  'Password is required',
                    minLength: { value: 8,     message: 'Min 8 characters' },
                    pattern:   { value: /(?=.*[A-Z])(?=.*\d)/, message: 'Need uppercase and number' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              {password && <PasswordStrength password={password} />}
            </div>

            <Button
              type="submit"
              loading={registerMutation.isPending}
              className="w-full py-2.5"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}