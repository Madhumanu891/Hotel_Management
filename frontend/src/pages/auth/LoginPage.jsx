import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Hotel, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const loginMutation = useLogin();

  const onSubmit = (data) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">NexoraHotels</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome back to<br />NexoraHotels
          </h1>
          <p className="text-primary-200 text-lg">
            Manage your hotel operations from anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Properties', value: '50+' },
            { label: 'Bookings/day', value: '1,200+' },
            { label: 'Staff members', value: '800+' },
            { label: 'Cities', value: '12' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-primary-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-primary-700 flex items-center justify-center">
              <Hotel className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">NexoraHotels</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to access your dashboard</p>

          {loginMutation.isError && (
            <div className="mb-6">
              <Alert
                type="error"
                message={loginMutation.error?.response?.data?.message || 'Login failed. Please try again.'}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex justify-between items-center mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-700 hover:text-primary-800 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              loading={loginMutation.isPending}
              className="w-full py-2.5"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            New guest?{' '}
            <Link to="/register" className="text-primary-700 hover:text-primary-800 font-medium">
              Create an account
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border">
            <p className="text-xs font-medium text-gray-500 mb-3">Demo accounts</p>
            <div className="space-y-2">
              {[
                { role: 'Guest',       email: 'madhu@hotel.com',  pass: 'Test1234!' },
                { role: 'Super Admin', email: 'admin@hotel.com',  pass: 'Admin1234!' },
              ].map(acc => (
                <div key={acc.role} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700">{acc.role}</span>
                  <span className="text-gray-500">{acc.email} / {acc.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}