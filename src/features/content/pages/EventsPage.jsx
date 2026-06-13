import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Edit2, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { contentService } from '../../../services/contentService';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Dialog from '../../../components/ui/Dialog';
import EmptyState from '../../../components/data-display/EmptyState';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import { formatDateTime } from '../../../utils/helpers';

const emptyForm = { title: '', description: '', date: '', location: '' };

export default function EventsPage({ readOnly = false }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (readOnly) {
      localStorage.setItem('lastSeenEvents', new Date().toISOString());
    }
  }, [readOnly]);

  const eventsQuery = useQuery({
    queryKey: ['events', search],
    queryFn: () => contentService.getEvents({ search }),
  });

  const saveMutation = useMutation({
    mutationFn: () => contentService.saveEvent(form),
    onSuccess: async (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      await activityService.logActivity(form.id ? 'edit_event' : 'create_event', { id: event.id, title: event.title });
      toast.success(form.id ? 'Event updated.' : 'Event created.');
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err.message || 'Unable to save event.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentService.deleteEvent(id),
    onSuccess: async (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      await activityService.logActivity('delete_event', { id });
      toast.success('Event deleted.');
    },
  });

  return (
    <PageWrapper
      title="Events"
      subtitle={readOnly ? 'Association meetings and farmer welfare events.' : 'Create and manage association meetings and events.'}
      actions={!readOnly && (
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>Create Event</Button>
      )}
    >
      <Card className="mb-6">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events..." leftIcon={<Search className="w-4 h-4" />} />
      </Card>

      {eventsQuery.isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : !eventsQuery.data?.length ? (
        <Card><EmptyState icon={Calendar} title="No events found" description="Events created by admins will appear here." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {eventsQuery.data.map((event) => (
            <Card key={event.id} hover>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">{formatDateTime(event.date)}</p>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">{event.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{event.description || 'No description provided.'}</p>
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-4">
                    <MapPin className="w-4 h-4 text-gray-400" /> {event.location || 'Location not specified'}
                  </p>
                </div>
                {!readOnly && (
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500" onClick={() => { setForm(event); setDialogOpen(true); }} title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500" onClick={() => deleteMutation.mutate(event.id)} title="Delete">
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
        title={form.id ? 'Edit Event' : 'Create Event'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save Event</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <Input label="Date and Time" type="datetime-local" value={form.date?.slice(0, 16) || ''} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          <Input label="Location" value={form.location || ''} onChange={(event) => setForm({ ...form, location: event.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </Dialog>
    </PageWrapper>
  );
}
