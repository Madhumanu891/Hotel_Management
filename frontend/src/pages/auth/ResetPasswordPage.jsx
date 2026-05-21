import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Hotel, Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Alert  from '../../components/ui/Alert';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const resetMutation = useResetPassword();

  const onSubmit = (data) => resetMutation.mutate({ token, password: data.password });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-700 flex items-center justify-center">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl">NexoraHotels</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h2>
        <p className="text-gray-500 mb-8">Choose a strong password for your account</p>

        {resetMutation.isError && (
          <div className="mb-6">
            <Alert
              type="error"
              message={resetMutation.error?.response?.data?.message || 'Reset link is invalid or expired.'}
            />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">New password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                {...register('password', {
                  required:  'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' },
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
          </div>

          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              className={`input ${errors.confirm ? 'input-error' : ''}`}
              {...register('confirm', {
                required: 'Please confirm your password',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>}
          </div>

          <Button type="submit" loading={resetMutation.isPending} className="w-full py-2.5">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}