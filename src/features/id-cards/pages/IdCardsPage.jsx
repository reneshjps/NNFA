import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Printer, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { memberService } from '../../../services/memberService';
import { downloadIdCardPdf } from '../../../services/idCardService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import MemberIdCard from '../../../components/data-display/MemberIdCard';
import MemberIdCardWrapper from '../../../components/data-display/MemberIdCardWrapper';
import EmptyState from '../../../components/data-display/EmptyState';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';

export default function IdCardsPage() {
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const membersQuery = useQuery({
    queryKey: ['id-card-members', search],
    queryFn: () => memberService.getMembers({ search, page: 1, limit: 10, sortBy: 'name', sortDir: 'asc' }),
    enabled: search.trim().length >= 2,
  });

  const handleDownload = async () => {
    if (!selectedMember) return;
    try {
      await downloadIdCardPdf(selectedMember);
      toast.success('ID card PDF generated.');
    } catch (err) {
      toast.error(err.message || 'Unable to generate PDF.');
    }
  };

  return (
    <PageWrapper title="ID Cards" subtitle="Generate, preview, download, and print member ID cards.">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Select Member</Card.Title>
            <Card.Description>Search by member ID, name, mobile number, or village.</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member for ID card..."
              leftIcon={<Search className="w-4 h-4" />}
            />

            {membersQuery.isLoading ? (
              <LoadingSkeleton type="table" count={4} />
            ) : search.trim().length < 2 ? (
              <EmptyState title="Start searching" description="Type at least two characters to find a member." className="py-8" />
            ) : !membersQuery.data?.data?.length ? (
              <EmptyState title="No member found" description="No matching member is available for card generation." className="py-8" />
            ) : (
              <div className="space-y-2">
                {membersQuery.data.data.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      selectedMember?.id === member.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                        <p className="font-mono text-xs text-green-600 dark:text-green-400">{member.member_id}</p>
                      </div>
                      <Badge variant={member.status === 'active' ? 'success' : member.status === 'expired' ? 'danger' : 'warning'} dot>
                        {member.status?.toUpperCase()}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <Card.Title>Card Preview</Card.Title>
                <Card.Description>Preview matches the printable digital card layout.</Card.Description>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" leftIcon={<Printer className="w-4 h-4" />} disabled={!selectedMember} onClick={() => window.print()}>
                  Print
                </Button>
                <Button leftIcon={<Download className="w-4 h-4" />} disabled={!selectedMember} onClick={handleDownload}>
                  PDF
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            {selectedMember ? (
              <MemberIdCardWrapper>
                <MemberIdCard member={selectedMember} />
              </MemberIdCardWrapper>
            ) : (
              <EmptyState title="No card selected" description="Choose a member to preview their digital ID card." />
            )}
          </Card.Content>
        </Card>
      </div>
    </PageWrapper>
  );
}
