import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, Clock3, IndianRupee, RefreshCw, Search, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { activityService } from '../../../services/activityService';
import { memberService } from '../../../services/memberService';
import { renewalService } from '../../../services/renewalService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import EmptyState from '../../../components/data-display/EmptyState';
import Pagination from '../../../components/data-display/Pagination';
import { daysUntilExpiry, formatDate } from '../../../utils/helpers';

const renewalOptions = [
  { value: '1_year', label: '1 Year', amount: 1000, description: 'Extends validity by one year from the current expiry date.' },
  { value: '3_years', label: '3 Years', amount: 2500, description: 'Best for long-running member continuity.' },
  { value: 'lifetime', label: 'Lifetime', amount: 5000, description: 'Marks the member as permanently valid.' },
];

const statusVariant = {
  active: 'success',
  expired: 'danger',
  suspended: 'warning',
};

export default function RenewalsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const requestedMemberId = new URLSearchParams(location.search).get('memberId') || '';

  const [memberSearch, setMemberSearch] = useState(requestedMemberId);
  const [selectedMember, setSelectedMember] = useState(null);
  const [renewalType, setRenewalType] = useState('1_year');
  const [amount, setAmount] = useState(1000);
  const [historySearch, setHistorySearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const membersQuery = useQuery({
    queryKey: ['renewal-member-search', memberSearch],
    queryFn: () =>
      memberService.getMembers({
        search: memberSearch,
        page: 1,
        limit: 8,
        sortBy: 'name',
        sortDir: 'asc',
      }),
    enabled: memberSearch.trim().length >= 2,
  });

  const renewalHistoryQuery = useQuery({
    queryKey: ['renewals', { historySearch, page }],
    queryFn: () => renewalService.getRenewals({ search: historySearch, page, limit }),
  });

  const memberRenewalsQuery = useQuery({
    queryKey: ['member-renewals', selectedMember?.id],
    queryFn: () => renewalService.getMemberRenewals(selectedMember.id),
    enabled: !!selectedMember?.id,
  });

  const renewMutation = useMutation({
    mutationFn: () => renewalService.renewMembership({ member: selectedMember, renewalType, amount }),
    onSuccess: async (renewal) => {
      toast.success('Membership renewed successfully.');
      queryClient.invalidateQueries({ queryKey: ['renewals'] });
      queryClient.invalidateQueries({ queryKey: ['member-renewals', selectedMember?.id] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', selectedMember?.id] });
      await activityService.logActivity('renew_membership', {
        member_id: selectedMember?.member_id,
        name: selectedMember?.name,
        renewal_type: renewalType,
        valid_until: renewal?.valid_until,
        amount: amount ? Number(amount) : null,
      });
      setSelectedMember((current) =>
        current ? { ...current, valid_until: renewal?.valid_until || current.valid_until, status: 'active' } : current
      );
    },
    onError: (err) => {
      toast.error(err.message || 'Unable to renew membership.');
    },
  });

  const daysLeft = selectedMember ? daysUntilExpiry(selectedMember.valid_until) : null;
  const selectedMemberExpired = selectedMember && (selectedMember.status === 'expired' || daysLeft <= 0);

  return (
    <PageWrapper
      title="Membership Renewal"
      subtitle="Renew memberships for 1 year, 3 years, or lifetime and maintain renewal history."
      actions={
        <Button variant="secondary" leftIcon={<UserRound className="w-4 h-4" />} onClick={() => navigate('/admin/members')}>
          Member Registry
        </Button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Find Member</Card.Title>
              <Card.Description>Search by member ID, name, mobile number, or village.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              <Input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Example: NNFA-0001 or mobile number"
                leftIcon={<Search className="w-4 h-4" />}
              />

              {membersQuery.isLoading ? (
                <LoadingSkeleton type="table" count={3} />
              ) : memberSearch.trim().length < 2 ? (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Type at least two characters to search member records.
                </div>
              ) : !membersQuery.data?.data?.length ? (
                <EmptyState title="No members found" description="Try a different member ID, name, mobile number, or village." className="py-8" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {membersQuery.data.data.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        selectedMember?.id === member.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-500/20'
                          : 'border-gray-200 bg-white hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                          <p className="font-mono text-xs text-green-600 dark:text-green-400 mt-1">{member.member_id}</p>
                        </div>
                        <Badge variant={statusVariant[member.status] || 'default'} dot size="sm">
                          {member.status?.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{member.mobile || 'No mobile'}</span>
                        <span className="text-right">{member.district || 'No district'}</span>
                        <span>{member.village || 'No village'}</span>
                        <span className="text-right">Valid: {formatDate(member.valid_until)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Renew Membership</Card.Title>
              <Card.Description>Select a renewal plan and confirm the receipt amount.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-5">
              {selectedMember ? (
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{selectedMember.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {selectedMember.member_id} | Current validity: {formatDate(selectedMember.valid_until)}
                      </p>
                    </div>
                    <Badge variant={selectedMemberExpired ? 'danger' : 'success'} dot>
                      {selectedMemberExpired ? 'RENEWAL DUE' : 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-slate-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Select a member from the search results to begin renewal.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {renewalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setRenewalType(option.value);
                      setAmount(option.amount);
                    }}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      renewalType === option.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-500/20'
                        : 'border-gray-200 bg-white hover:border-green-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</span>
                      {renewalType === option.value && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                    <p className="mt-3 flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {option.amount.toLocaleString('en-IN')}
                    </p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Receipt Amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  leftIcon={<IndianRupee className="w-4 h-4" />}
                />
                <div className="flex items-end">
                  <Button
                    fullWidth
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    disabled={!selectedMember}
                    isLoading={renewMutation.isPending}
                    onClick={() => renewMutation.mutate()}
                  >
                    Confirm Renewal
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Selected Member History</Card.Title>
              <Card.Description>Renewal records for the chosen member.</Card.Description>
            </Card.Header>
            <Card.Content>
              {!selectedMember ? (
                <EmptyState icon={Clock3} title="No member selected" description="Choose a member to see their renewal timeline." className="py-8" />
              ) : memberRenewalsQuery.isLoading ? (
                <LoadingSkeleton type="card" count={2} />
              ) : !memberRenewalsQuery.data?.length ? (
                <EmptyState icon={CalendarClock} title="No renewals yet" description="This member has no renewal history recorded." className="py-8" />
              ) : (
                <div className="space-y-3">
                  {memberRenewalsQuery.data.map((renewal) => (
                    <div key={renewal.id} className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge variant="info">{renewalService.renewalLabels[renewal.renewal_type]}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(renewal.renewed_on)}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Valid until {formatDate(renewal.valid_until)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Amount: {renewal.amount ? `Rs. ${Number(renewal.amount).toLocaleString('en-IN')}` : 'Not recorded'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      <Card className="mt-6" padding="p-0">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Renewal History</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest renewals across all member records.</p>
            </div>
            <Input
              value={historySearch}
              onChange={(event) => {
                setHistorySearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search history..."
              leftIcon={<Search className="w-4 h-4" />}
              containerClassName="w-full md:w-80"
            />
          </div>
        </div>

        {renewalHistoryQuery.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton type="table" count={limit} />
          </div>
        ) : !renewalHistoryQuery.data?.data?.length ? (
          <EmptyState icon={CalendarClock} title="No renewal records" description="Renewed memberships will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Member</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Renewal</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Renewed On</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Valid Until</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {renewalHistoryQuery.data.data.map((renewal) => (
                    <tr key={renewal.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{renewal.member?.name || 'Member'}</div>
                        <div className="font-mono text-xs text-green-600 dark:text-green-400">{renewal.member?.member_id || renewal.member_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{renewalService.renewalLabels[renewal.renewal_type]}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(renewal.renewed_on)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(renewal.valid_until)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 text-right">
                        {renewal.amount ? `Rs. ${Number(renewal.amount).toLocaleString('en-IN')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renewalHistoryQuery.data.total_pages > 1 && (
              <div className="flex justify-center p-5 border-t border-gray-100 dark:border-slate-700">
                <Pagination currentPage={page} totalPages={renewalHistoryQuery.data.total_pages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
