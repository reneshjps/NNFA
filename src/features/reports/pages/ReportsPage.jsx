import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileSpreadsheet, FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../../../services/reportService';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import EmptyState from '../../../components/data-display/EmptyState';
import { DISTRICTS } from '../../../utils/constants';
import { formatDate } from '../../../utils/helpers';

const reportTypes = [
  { value: 'all', label: 'All Members' },
  { value: 'active', label: 'Active Members' },
  { value: 'expired', label: 'Expired Members' },
  { value: 'district', label: 'District Wise' },
  { value: 'village', label: 'Village Wise' },
  { value: 'renewals', label: 'Renewal Report' },
];

export default function ReportsPage() {
  const [type, setType] = useState('all');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [preview, setPreview] = useState(false);

  const reportQuery = useQuery({
    queryKey: ['member-report', { type, district, village, preview }],
    queryFn: () => type === 'renewals'
      ? reportService.getRenewalReport()
      : reportService.getMemberReport({ type, district, village }),
    enabled: preview,
  });

  const rows = reportQuery.data || [];

  const handleExportExcel = async () => {
    const data = preview ? rows : type === 'renewals'
      ? await reportService.getRenewalReport()
      : await reportService.getMemberReport({ type, district, village });
    if (type === 'renewals') {
      reportService.exportRenewalsExcel(data, 'NNFA_Renewal_Report');
    } else {
      reportService.exportMembersExcel(data, `NNFA_${type}_Report`);
    }
    await activityService.logActivity('export_report', { type, format: 'excel', records_count: data.length });
    toast.success(`Exported ${data.length} rows to Excel.`);
  };

  const handleExportPdf = async () => {
    const data = preview ? rows : type === 'renewals'
      ? await reportService.getRenewalReport()
      : await reportService.getMemberReport({ type, district, village });
    if (type === 'renewals') {
      reportService.exportRenewalsPdf(data);
    } else {
      reportService.exportMembersPdf(data, `NNFA ${reportTypes.find((item) => item.value === type)?.label || 'Report'}`);
    }
    await activityService.logActivity('export_report', { type, format: 'pdf', records_count: data.length });
    toast.success('PDF report generated.');
  };

  return (
    <PageWrapper title="Reports" subtitle="Generate member, district, village, and status reports with Excel/PDF export.">
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Report Type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100"
            >
              {reportTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">District</label>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100"
            >
              <option value="">All Districts</option>
              {DISTRICTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <Input
            label="Village Contains"
            value={village}
            disabled={type === 'renewals'}
            onChange={(event) => setVillage(event.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <div className="flex items-end gap-2">
            <Button fullWidth leftIcon={<FileText className="w-4 h-4" />} onClick={() => setPreview(true)}>Preview</Button>
          </div>
        </div>
      </Card>

      <Card padding="p-0">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report Preview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{preview ? `${rows.length} records ready` : 'Choose filters and preview the report.'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleExportExcel}>Excel</Button>
            <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleExportPdf}>PDF</Button>
          </div>
        </div>

        {reportQuery.isLoading ? (
          <div className="p-5"><LoadingSkeleton type="table" count={8} /></div>
        ) : !preview ? (
          <EmptyState title="No preview yet" description="Run a report to see matching records." />
        ) : rows.length === 0 ? (
          <EmptyState title="No records found" description="Adjust filters and try again." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  {(type === 'renewals'
                    ? ['Member', 'Renewal', 'Renewed On', 'Valid Until', 'Amount']
                    : ['Member', 'Mobile', 'Location', 'Designation', 'Status', 'Valid Until']
                  ).map((heading) => (
                    <th key={heading} className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {rows.slice(0, 100).map((row) => type === 'renewals' ? (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{row.member?.name || 'Member'}</p>
                      <p className="font-mono text-xs text-green-600 dark:text-green-400">{row.member?.member_id || row.member_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{row.renewal_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(row.renewed_on)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(row.valid_until)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{row.amount ? `Rs. ${Number(row.amount).toLocaleString('en-IN')}` : '-'}</td>
                  </tr>
                ) : (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</p>
                      <p className="font-mono text-xs text-green-600 dark:text-green-400">{row.member_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{row.mobile}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{row.village || '-'}, {row.district || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{row.designation || 'Member'}</td>
                    <td className="px-6 py-4"><Badge variant={row.status === 'active' ? 'success' : row.status === 'expired' ? 'danger' : 'warning'} dot>{row.status}</Badge></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(row.valid_until)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}
