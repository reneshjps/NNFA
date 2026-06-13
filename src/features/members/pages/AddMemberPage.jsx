import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { memberService } from '../../../services/memberService';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import MemberForm from '../components/MemberForm';
import toast from 'react-hot-toast';

export default function AddMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (newMemberData) => memberService.createMember(newMemberData),
    onSuccess: async (data) => {
      toast.success(`Farmer "${data.name}" registered successfully with ID: ${data.member_id}`);
      queryClient.invalidateQueries(['members']);
      
      // Log admin activity
      await activityService.logActivity('add_member', { 
        id: data.id, 
        member_id: data.member_id,
        name: data.name 
      });

      navigate('/admin/members');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to register farmer member.');
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  return (
    <PageWrapper
      title="Register Member"
      subtitle="Register a new farmer member into the association records."
    >
      <MemberForm 
        onSubmit={onSubmit} 
        isLoading={createMutation.isPending} 
      />
    </PageWrapper>
  );
}
