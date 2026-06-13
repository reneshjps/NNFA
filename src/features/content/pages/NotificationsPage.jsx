import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { contentService } from '../../../services/contentService';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Dialog from '../../../components/ui/Dialog';
import EmptyState from '../../../components/data-display/EmptyState';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import { formatDateTime } from '../../../utils/helpers';

const emptyForm = { title: '', message: '', type: 'announcement' };
const typeLabels = {
  announcement: 'Announcement',
  expiry_reminder: 'Expiry Reminder',
  meeting: 'Meeting Notice',
};

export default function NotificationsPage({ readOnly = false }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (readOnly) {
      localStorage.setItem('lastSeenAnnouncements', new Date().toISOString());
    }
  }, [readOnly]);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', { search, type }],
    queryFn: () => contentService.getNotifications({ search, type }),
  });

  const saveMutation = useMutation({
    mutationFn: () => contentService.saveNotification(form),
    onSuccess: async (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await activityService.logActivity(form.id ? 'edit_notification' : 'create_notification', { id: notification.id, title: notification.title });
      toast.success(form.id ? 'Notification updated.' : 'Notification created.');
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err.message || 'Unable to save notification.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted.');
    },
  });

  return (
    <PageWrapper
      title={readOnly ? 'Announcements' : 'Notifications'}
      subtitle={readOnly ? 'Latest association announcements and meeting notices.' : 'Manage announcements, expiry reminders, and meeting notices.'}
      actions={!readOnly && (
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>Create Notice</Button>
      )}
    >
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notices..." leftIcon={<Search className="w-4 h-4" />} />
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100">
            <option value="">All Types</option>
            {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </Card>

      {notificationsQuery.isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : !notificationsQuery.data?.length ? (
        <Card><EmptyState icon={Bell} title="No notices found" description="Announcements and reminders will appear here." /></Card>
      ) : (
        <div className="space-y-4">
          {notificationsQuery.data.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant={item.type === 'expiry_reminder' ? 'warning' : item.type === 'meeting' ? 'info' : 'success'}>{typeLabels[item.type]}</Badge>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-3">{item.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.message}</p>
                  <p className="text-xs text-gray-400 mt-3">{formatDateTime(item.created_at)}</p>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500" onClick={() => { setForm(item); setDialogOpen(true); }} title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500" onClick={() => deleteMutation.mutate(item.id)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={form.id ? 'Edit Notice' : 'Create Notice'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save Notice</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100">
              {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
            <textarea value={form.message || ''} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={5} className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
          </div>
        </div>
      </Dialog>
    </PageWrapper>
  );
}
