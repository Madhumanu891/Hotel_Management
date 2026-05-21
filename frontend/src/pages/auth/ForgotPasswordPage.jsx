import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Hotel, ArrowLeft, Mail } from 'lucide-react';
import { useForgotPassword } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const forgotMutation = useForgotPassword();

  const onSubmit = (data) => forgotMutation.mutate(data.email);

  if (forgotMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 w-full max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-6">
            If an account exists for that email, we have sent a password reset link. Check your inbox.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-700 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">NexoraHotels</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset password</h2>
        <p className="text-gray-500 mb-8">Enter your email and we will send you a reset link</p>

        {forgotMutation.isError && (
          <div className="mb-6">
            <Alert type="error" message="Something went wrong. Please try again." />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`input ${errors.email ? 'input-error' : ''}`}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <Button type="submit" loading={forgotMutation.isPending} className="w-full py-2.5">
            Send reset link
          </Button>
        </form>

        <Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}