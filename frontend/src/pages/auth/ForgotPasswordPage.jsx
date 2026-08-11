import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Hotel, ArrowLeft, CheckCircle } from 'lucide-react';
import { useForgotPassword } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = (data) => forgotMutation.mutate(data.email);

  if (forgotMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="card dark:bg-slate-800 p-8 max-w-md w-full text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Check your inbox
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
            We have sent a password reset link to your email address.
            Check your spam folder if you don't see it.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-4">
            <Hotel className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Forgot your password?
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <div className="card dark:bg-slate-800 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button
              type="submit"
              loading={forgotMutation.isPending}
              fullWidth
              className="py-3"
            >
              Send Reset Link
            </Button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}