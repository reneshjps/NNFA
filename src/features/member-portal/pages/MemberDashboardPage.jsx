import { Link } from 'react-router-dom';
import { Calendar, Download, Megaphone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { downloadIdCardPdf } from '../../../services/idCardService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import MemberIdCard from '../../../components/data-display/MemberIdCard';
import MemberIdCardWrapper from '../../../components/data-display/MemberIdCardWrapper';
import { formatDate } from '../../../utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../../services/contentService';
import dayjs from 'dayjs';

export default function MemberDashboardPage() {
  const { user } = useAuthStore();

  const lastSeenEvents = localStorage.getItem('lastSeenEvents');
  const lastSeenAnnouncements = localStorage.getItem('lastSeenAnnouncements');

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: () => contentService.getEvents(),
  });

  const { data: announcements } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => contentService.getNotifications(),
  });

  const newEventsCount = events?.filter(e => {
    const itemDate = e.created_at || e.date;
    return !lastSeenEvents || dayjs(itemDate).isAfter(lastSeenEvents);
  }).length || 0;

  const newAnnouncementsCount = announcements?.filter(a => {
    const itemDate = a.created_at;
    return !lastSeenAnnouncements || dayjs(itemDate).isAfter(lastSeenAnnouncements);
  }).length || 0;

  const handleDownload = async () => {
    try {
      await downloadIdCardPdf(user);
      toast.success('ID card PDF generated.');
    } catch (err) {
      toast.error(err.message || 'Unable to generate PDF.');
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome, {user?.name || 'Member'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View your digital membership card and association updates.</p>
        </div>
        <Badge variant={user?.status === 'active' ? 'success' : user?.status === 'expired' ? 'danger' : 'warning'} dot size="lg">
          {user?.status?.toUpperCase() || 'ACTIVE'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <Card className="overflow-hidden">
          <Card.Content className="flex justify-center py-8">
            <MemberIdCardWrapper>
              <MemberIdCard member={user} />
            </MemberIdCardWrapper>
          </Card.Content>
        </Card>
        <div className="space-y-4">
          <Card>
            <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Membership Validity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Valid until {formatDate(user?.valid_until)}</p>
            <Button className="mt-4" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>Download Card</Button>
          </Card>
          <Card>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Quick Links</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/member/events" className="relative block">
                {newEventsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full z-10 shadow-sm border-2 border-white dark:border-slate-800">
                    {newEventsCount > 9 ? '9+' : newEventsCount}
                  </span>
                )}
                <Button variant="secondary" fullWidth leftIcon={<Calendar className="w-4 h-4" />}>
                  Events
                </Button>
              </Link>
              
              <Link to="/member/announcements" className="relative block">
                {newAnnouncementsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full z-10 shadow-sm border-2 border-white dark:border-slate-800">
                    {newAnnouncementsCount > 9 ? '9+' : newAnnouncementsCount}
                  </span>
                )}
                <Button variant="secondary" fullWidth leftIcon={<Megaphone className="w-4 h-4" />}>
                  Announcements
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
