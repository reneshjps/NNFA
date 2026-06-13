import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../../../services/memberService';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import MemberForm from '../components/MemberForm';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function EditMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Member Details
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => memberService.getMemberById(id),
    enabled: !!id,
  });

  // Update Member Mutation
  const updateMutation = useMutation({
    mutationFn: (updatedData) => memberService.updateMember(id, updatedData),
    onSuccess: async (data) => {
      toast.success(`Farmer details for "${data.name}" updated successfully.`);
      
      // Invalidate queries to refresh listing and detail pages
      queryClient.invalidateQueries(['members']);
      queryClient.invalidateQueries(['member', id]);

      // Log admin activity
      await activityService.logActivity('edit_member', {
        id: data.id,
        member_id: data.member_id,
        name: data.name,
      });

      navigate(`/admin/members/${id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update member records.');
    },
  });

  const onSubmit = (formData) => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Member" subtitle="Loading member profile details...">
        <div className="space-y-6">
          <LoadingSkeleton type="stats" count={1} />
          <LoadingSkeleton type="form" count={3} />
        </div>
      </PageWrapper>
    );
  }

  if (error || !member) {
    return (
      <PageWrapper title="Edit Member" subtitle="Error loading member records">
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/30">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Failed to load member records</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please verify the record exists and has not been deleted.</p>
          <Button onClick={() => navigate('/admin/members')}>Back to Registry</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Edit Member"
      subtitle={`Modifying profile details of member ${member.member_id} (${member.name}).`}
    >
      <MemberForm
        initialData={member}
        onSubmit={onSubmit}
        isLoading={updateMutation.isPending}
      />
    </PageWrapper>
  );
}
