import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Hotel } from 'lucide-react';
import { useState } from 'react';
import { useRegister } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const registerMutation    = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    registerMutation.mutate({
      name:     data.name,
      email:    data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Hotel className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Join NexoraHotels and start exploring
          </p>
        </div>

        {/* Card */}
        <div className="card dark:bg-slate-800 p-6">
          {registerMutation.isError && (
            <Alert
              type="error"
              message={registerMutation.error?.response?.data?.message || 'Registration failed'}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  className={`input pl-9 ${errors.name ? 'input-error' : ''}`}
                  placeholder="Madhu Dhanaveni"
                  {...register('name', {
                    required:  'Name is required',
                    minLength: { value: 2, message: 'Min 2 characters' },
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
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
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 8 characters"
                  {...register('password', {
                    required:  'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: {
                      value:   /(?=.*[A-Z])(?=.*\d)/,
                      message: 'Need uppercase letter and number',
                    },
                  })}
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
              loading={registerMutation.isPending}
              fullWidth
              className="py-3 mt-2"
            >
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-700 dark:text-primary-400 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}