import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Hotel,
  Star, Shield, Clock, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

const demoAccounts = [
  { role: 'Super Admin',    email: 'admin@hotel.com',          pass: 'Admin1234!',   color: 'text-purple-600 dark:text-purple-400'  },
  { role: 'Hotel Manager',  email: 'manager@hotel.com',        pass: 'Manager1234!', color: 'text-blue-600 dark:text-blue-400'      },
  { role: 'Receptionist',   email: 'receptionist@hotel.com',   pass: 'Staff1234!',   color: 'text-green-600 dark:text-green-400'    },
  { role: 'Housekeeping',   email: 'housekeeping@hotel.com',   pass: 'Staff1234!',   color: 'text-yellow-600 dark:text-yellow-400'  },
  { role: 'Restaurant',     email: 'restaurant@hotel.com',     pass: 'Staff1234!',   color: 'text-orange-600 dark:text-orange-400'  },
  { role: 'HR Manager',     email: 'hr@hotel.com',             pass: 'Staff1234!',   color: 'text-pink-600 dark:text-pink-400'      },
  { role: 'Accountant',     email: 'accountant@hotel.com',     pass: 'Staff1234!',   color: 'text-teal-600 dark:text-teal-400'      },
  { role: 'Guest',          email: 'guest@hotel.com',          pass: 'Guest1234!',   color: 'text-gray-600 dark:text-slate-400'     },
];

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const loginMutation       = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => loginMutation.mutate(data);

  const fillDemo = (email, pass) => {
    setValue('email',    email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-white">NexoraHotels</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Complete Hotel<br />
              <span className="text-yellow-300">Management</span><br />
              Platform
            </h2>
            <p className="text-primary-200 text-lg leading-relaxed">
              9 microservices. 8 role dashboards.<br />
              Real-time operations at scale.
            </p>
          </div>

          {/* Feature chips */}
          <div className="space-y-3">
            {[
              { icon: Shield, label: 'JWT + Redis security'     },
              { icon: Star,   label: 'Loyalty programme'         },
              { icon: Clock,  label: 'Real-time housekeeping'    },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-primary-100 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-primary-300 text-xs">
            Built by <span className="text-white font-semibold">Madhu Dhanaveni</span>
            {' '}— Full Stack Developer
          </p>
          <p className="text-primary-400 text-xs mt-1">
            MERN + Microservices + Docker + Redis + RabbitMQ
          </p>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-10 max-w-lg mx-auto w-full">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary-700 flex items-center justify-center">
              <Hotel className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">NexoraHotels</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error */}
          {loginMutation.isError && (
            <Alert
              type="error"
              message={loginMutation.error?.response?.data?.message || 'Login failed. Please try again.'}
              dismissible
              className="mb-5"
            />
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  {
                      value:   /\S+@\S+\.\S+/,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-700 dark:text-primary-400 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Your password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                >
                  {showPw
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={loginMutation.isPending}
              fullWidth
              className="py-3 mt-1"
            >
              Sign In
              <ChevronRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-700 dark:text-primary-400 font-semibold hover:underline"
            >
              Create one free
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t dark:border-slate-700">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Demo Accounts — Click to fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(({ role, email, pass, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(email, pass)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-800 border border-gray-200 dark:border-slate-700 transition-all text-left group"
                >
                  <span className={`text-xs font-semibold ${color}`}>
                    {role}
                  </span>
                  <ChevronRight className="h-3 w-3 text-gray-300 dark:text-slate-600 group-hover:text-primary-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}