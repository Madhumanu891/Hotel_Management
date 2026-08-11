import { useForm } from 'react-hook-form';
import { useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Hotel, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useResetPassword } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function ResetPasswordPage() {
  const { token }          = useParams();
  const [showPw, setShowPw] = useState(false);
  const resetMutation       = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    resetMutation.mutate({ token, password: data.password });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-4">
            <Hotel className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Choose a strong new password
          </p>
        </div>

        <div className="card dark:bg-slate-800 p-6">
          {resetMutation.isError && (
            <Alert
              type="error"
              message={resetMutation.error?.response?.data?.message || 'Link expired. Request a new one.'}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">New Password</label>
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
                      message: 'Need uppercase and number',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  className={`input pl-9 ${errors.confirm ? 'input-error' : ''}`}
                  placeholder="Repeat new password"
                  {...register('confirm', {
                    required: 'Please confirm password',
                    validate: v =>
                      v === watch('password') || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.confirm.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={resetMutation.isPending}
              fullWidth
              className="py-3"
            >
              Update Password
            </Button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}