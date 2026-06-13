import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Calendar, MapPin, Phone, User, Shield, Briefcase, Heart, Truck, Trash2, ArrowLeft, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { memberService } from '../../../services/memberService';
import { activityService } from '../../../services/activityService';
import { useAuthStore } from '../../../store/authStore';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import Dialog from '../../../components/ui/Dialog';
import toast from 'react-hot-toast';
import { formatDate, daysUntilExpiry } from '../../../utils/helpers';

const statusVariant = {
  active: 'success',
  expired: 'danger',
  suspended: 'warning',
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role: userRole } = useAuthStore();
  const isSuperAdmin = userRole === 'super_admin';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch Member Details
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => memberService.getMemberById(id),
    enabled: !!id,
  });

  // Delete Member Mutation
  const deleteMutation = useMutation({
    mutationFn: () => memberService.deleteMember(id),
    onSuccess: async () => {
      toast.success('Member record deleted.');
      queryClient.invalidateQueries(['members']);
      await activityService.logActivity('delete_member', { 
        id, 
        member_id: member?.member_id,
        name: member?.name 
      });
      navigate('/admin/members');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete member');
    }
  });

  if (isLoading) {
    return (
      <PageWrapper title="Member Profile" subtitle="Loading farmer registration data...">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LoadingSkeleton type="card" count={1} />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <LoadingSkeleton type="form" count={3} />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !member) {
    return (
      <PageWrapper title="Member Profile" subtitle="Profile not found">
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/30">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Failed to load member details</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">The member profile record is missing or deleted.</p>
          <Button onClick={() => navigate('/admin/members')}>Return to Registry</Button>
        </div>
      </PageWrapper>
    );
  }

  const daysLeft = daysUntilExpiry(member.valid_until);
  const isNearExpiry = member.status === 'active' && daysLeft > 0 && daysLeft <= 30;
  const isExpired = member.status === 'expired' || daysLeft <= 0;

  return (
    <PageWrapper
      title="Member Profile"
      subtitle={`Detailed records for member ID ${member.member_id}.`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/admin/members')}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Edit className="w-4 h-4" />}
            onClick={() => navigate(`/admin/members/${member.id}/edit`)}
          >
            Edit Profile
          </Button>
          <Button
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => navigate(`/admin/renewals?memberId=${member.member_id}`)}
          >
            Renew
          </Button>
          {isSuperAdmin && (
            <Button
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      }
    >
      {/* Expiry / Renewal Warning Banner */}
      {isExpired && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Membership Has Expired</h4>
            <p className="text-xs mt-1">This member's validation period ended on {formatDate(member.valid_until)}. Please renew the membership to enable association access and verification logs.</p>
          </div>
        </div>
      )}
      {isNearExpiry && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-3 text-amber-800 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Membership Approaching Expiry</h4>
            <p className="text-xs mt-1">This member's validation period ends in {daysLeft} days ({formatDate(member.valid_until)}). Consider initiating the renewal checklist soon.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Photos & Signatures */}
        <div className="lg:col-span-1 space-y-6">
          {/* Photos */}
          <Card>
            <Card.Content className="pt-6 text-center">
              <div className="w-36 h-36 rounded-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 flex items-center justify-center mx-auto overflow-hidden shadow-inner mb-4">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-300 dark:text-gray-500" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{member.name}</h3>
              <p className="text-xs font-mono text-green-600 dark:text-green-400 mt-1">{member.member_id}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-center">
                <Badge variant={statusVariant[member.status]} dot size="md">
                  {member.status.toUpperCase()}
                </Badge>
              </div>
            </Card.Content>
          </Card>

          {/* Signature */}
          <Card>
            <Card.Header className="pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Signature Asset</span>
            </Card.Header>
            <Card.Content className="text-center">
              <div className="h-20 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
                {member.signature_url ? (
                  <img
                    src={member.signature_url}
                    alt="Signature"
                    className="h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No signature uploaded</span>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Column: Member Details */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Personal details */}
          <Card>
            <Card.Header>
              <Card.Title>Farmer Personal Details</Card.Title>
            </Card.Header>
            <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.occupation || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.mobile}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(member.dob)}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.blood_group || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhar Number</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {member.aadhar_number ? `${member.aadhar_number.slice(0, 4)}-${member.aadhar_number.slice(4, 8)}-${member.aadhar_number.slice(8)}` : '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Number</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.vehicle_number || '—'}</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Location details */}
          <Card>
            <Card.Header>
              <Card.Title>Geographical details</Card.Title>
            </Card.Header>
            <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">District</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.district || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Taluk</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.taluk || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Village</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.village || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 md:col-span-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Residential Address</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 whitespace-pre-wrap">{member.address || '—'}</div>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Association details */}
          <Card>
            <Card.Header>
              <Card.Title>Association Metadata</Card.Title>
            </Card.Header>
            <Card.Content className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.designation || 'Member'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Number</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{member.registration_number || '—'}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(member.joining_date)}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formatDate(member.valid_until)}</div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {isSuperAdmin && (
        <Dialog.Confirm
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete Member Profile"
          message={`Are you sure you want to permanently delete the profile for "${member.name}" (${member.member_id})? All associated renewal records will be deleted. This action cannot be undone.`}
          confirmText="Delete Record"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
        />
      )}
    </PageWrapper>
  );
}
