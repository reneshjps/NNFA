import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search } from 'lucide-react';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/data-display/EmptyState';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import Pagination from '../../../components/data-display/Pagination';
import { formatDateTime } from '../../../utils/helpers';

export default function ActivityLogsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const logsQuery = useQuery({
    queryKey: ['activity-logs', { search, page }],
    queryFn: () => activityService.getLogs({ search, page, limit }),
  });

  const totalPages = Math.max(1, Math.ceil((logsQuery.data?.count || 0) / limit));

  return (
    <PageWrapper title="Activity Logs" subtitle="Audit trail for login, member changes, renewals, exports, and content updates.">
      <Card className="mb-6">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search action, member ID, or details..."
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      <Card padding="p-0">
        {logsQuery.isLoading ? (
          <div className="p-5"><LoadingSkeleton type="table" count={10} /></div>
        ) : !logsQuery.data?.data?.length ? (
          <EmptyState icon={ClipboardList} title="No activity logs" description="Administrative activity will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    {['Action', 'Admin', 'Details', 'Timestamp'].map((heading) => (
                      <th key={heading} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {logsQuery.data.data.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                      <td className="px-6 py-4"><Badge variant="info">{log.action}</Badge></td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{log.admin?.name || log.admin?.email || 'System'}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400 max-w-xl truncate">{JSON.stringify(log.details || {})}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDateTime(log.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center p-5 border-t border-gray-100 dark:border-slate-700">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </Card>
    </PageWrapper>
  );
}
