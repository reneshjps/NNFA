import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService } from '../../../services/reportService';
import { activityService } from '../../../services/activityService';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/data-display/EmptyState';

export default function ImportMembersPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleParse = async (selectedFile) => {
    setFile(selectedFile);
    const parsed = await reportService.parseMembersExcel(selectedFile);
    setPreview(parsed);
  };

  const handleImport = async () => {
    if (!preview?.rows?.length) return;
    setIsImporting(true);
    try {
      const result = await reportService.importMembers(preview.rows);
      await activityService.logActivity('import_members', {
        created: result.created.length,
        failed: result.failed.length,
      });
      toast.success(`Imported ${result.created.length} members.`);
      setPreview({ ...preview, result });
    } catch (err) {
      toast.error(err.message || 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <PageWrapper title="Excel Import" subtitle="Bulk upload member records while preventing duplicate member IDs and phone numbers.">
      <Card className="mb-6">
        <label className="block rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-8 text-center cursor-pointer hover:border-green-400 dark:hover:border-green-700 transition-colors">
          <UploadCloud className="w-10 h-10 mx-auto text-green-600 dark:text-green-400 mb-3" />
          <p className="font-semibold text-gray-900 dark:text-gray-100">{file ? file.name : 'Upload Excel file'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accepted formats: .xlsx, .xls</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) handleParse(selectedFile);
            }}
          />
        </label>
      </Card>

      {!preview ? (
        <Card><EmptyState title="No file selected" description="Upload an Excel sheet to validate member rows before import." /></Card>
      ) : (
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Import Preview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{preview.rows.length} valid rows, {preview.issues.length} issues found.</p>
            </div>
            <Button disabled={!preview.rows.length} isLoading={isImporting} onClick={handleImport}>Import Valid Rows</Button>
          </div>

          {preview.issues.length > 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Validation Issues</h3>
              <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300 max-h-40 overflow-y-auto">
                {preview.issues.map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  {['Member ID', 'Name', 'Mobile', 'District', 'Village', 'Status'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {preview.rows.slice(0, 50).map((member, index) => (
                  <tr key={`${member.mobile}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-green-600 dark:text-green-400">{member.member_id || 'Auto'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{member.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.mobile}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.district}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.village}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageWrapper>
  );
}
