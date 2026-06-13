import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { memberAuth } from '../../../services/authService';
import { useAuthStore } from '../../../store/authStore';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function QRLoginRedirect() {
  const { memberId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const performLogin = async () => {
      try {
        const mobile = searchParams.get('m');
        const dob = searchParams.get('d');

        if (!mobile || !dob) {
          throw new Error('QR code is missing login credentials. Please login manually.');
        }

        const member = await memberAuth.login(mobile, dob);
        
        // Ensure the ID matches (security check)
        if (member.member_id !== memberId) {
          throw new Error('QR code data mismatch.');
        }

        // Auto-login success
        setAuth(member, 'member', null);
        setStatus('success');
        toast.success(`Welcome, ${member.name}!`);
        navigate('/member/dashboard');
      } catch (err) {
        console.error('QR Login Error:', err);
        setStatus('error');
        toast.error(err.message || 'Invalid ID Card QR Code.');
        navigate('/member-login');
      }
    };

    performLogin();
  }, [memberId, searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Authenticating...</h2>
        <LoadingSkeleton type="list" count={3} />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Verifying ID Card. Please wait...</p>
      </div>
    </div>
  );
}
