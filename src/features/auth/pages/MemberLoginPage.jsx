import { useNavigate, Link } from 'react-router-dom';
import { Phone, Calendar, Sprout } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import toast from 'react-hot-toast';
import { memberAuth } from '../../../services/authService';

export default function MemberLoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      mobile: '',
      dob: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const member = await memberAuth.login(data.mobile, data.dob);
      
      setAuth(member, 'member', null);
      
      toast.success(`Welcome, ${member.name}!`);
      navigate('/member/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/30">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Member Login
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Login with your registered mobile number
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.mobile?.message}
            required
            {...register('mobile', {
              required: 'Mobile number is required',
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: 'Enter a valid 10-digit mobile number',
              },
            })}
          />

          <Input
            label="Date of Birth"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.dob?.message}
            required
            {...register('dob', {
              required: 'Date of birth is required',
            })}
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
          >
            Login
          </Button>
        </form>

        {/* Admin login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you an admin?{' '}
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            >
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
