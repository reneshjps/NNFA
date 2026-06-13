import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Home } from 'lucide-react';
import { memberService } from '../../../services/memberService';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import { formatDate } from '../../../utils/helpers';

export default function VerificationPage() {
  const { memberId } = useParams();
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['verify-member', memberId],
    queryFn: () => memberService.getMemberByMemberId(memberId),
    enabled: !!memberId,
  });

  const isActive = member?.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <Card>
          {isLoading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : error || !member ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Verification Failed</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This member ID was not found in the association records.</p>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle2 className={`w-14 h-14 mx-auto mb-4 ${isActive ? 'text-green-600' : 'text-amber-500'}`} />
              <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Membership Verification</p>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{member.name}</h1>
              <p className="font-mono text-sm text-green-600 dark:text-green-400 mt-1">{member.member_id}</p>
              <div className="mt-5 flex justify-center">
                <Badge variant={isActive ? 'success' : member.status === 'expired' ? 'danger' : 'warning'} dot size="lg">
                  {member.status?.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                <Info label="District" value={member.district} />
                <Info label="Designation" value={member.designation || 'Member'} />
                <Info label="Village" value={member.village} />
                <Info label="Valid Until" value={formatDate(member.valid_until)} />
              </div>
            </div>
          )}
        </Card>
        <div className="mt-5 text-center">
          <Link to="/member-login">
            <Button variant="secondary" leftIcon={<Home className="w-4 h-4" />}>Member Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{value || '-'}</p>
    </div>
  );
}
