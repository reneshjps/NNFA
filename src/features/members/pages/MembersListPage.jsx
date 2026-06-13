import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search, Filter, Download, Eye, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { memberService } from '../../../services/memberService';
import { activityService } from '../../../services/activityService';
import { useAuthStore } from '../../../store/authStore';
import PageWrapper from '../../../components/layout/PageWrapper';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/data-display/EmptyState';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import Pagination from '../../../components/data-display/Pagination';
import Dialog from '../../../components/ui/Dialog';
import toast from 'react-hot-toast';
import { DISTRICTS, DESIGNATIONS, MEMBER_STATUS } from '../../../utils/constants';
import { formatDate } from '../../../utils/helpers';
import * as XLSX from 'xlsx';

const statusVariant = {
  active: 'success',
  expired: 'danger',
  suspended: 'warning',
};

export default function MembersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role: userRole } = useAuthStore();
  const isSuperAdmin = userRole === 'super_admin';

  // State Management
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [designation, setDesignation] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch Members Query
  const { 
    data: memberResults, 
    isLoading, 
    isFetching,
    error 
  } = useQuery({
    queryKey: ['members', { search, district, status, designation, page, sortBy, sortDir }],
    queryFn: () => memberService.getMembers({
      search,
      district,
      status,
      designation,
      page,
      limit,
      sortBy,
      sortDir,
    }),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => memberService.deleteMember(id),
    onSuccess: async (_, id) => {
      toast.success('Member record deleted successfully.');
      queryClient.invalidateQueries(['members']);
      await activityService.logActivity('delete_member', { member_id: id });
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete member');
    }
  });

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedMember) {
      deleteMutation.mutate(selectedMember.id);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  // Reset Filters helper
  const handleClearFilters = () => {
    setSearch('');
    setDistrict('');
    setStatus('');
    setDesignation('');
    setPage(1);
  };

  // Export current search results to Excel
  const handleExportExcel = async () => {
    try {
      toast.loading('Preparing Excel export...', { id: 'export' });
      // Fetch all matching records without pagination for export
      const allMatches = await memberService.getMembers({
        search,
        district,
        status,
        designation,
        page: 1,
        limit: 10000, // Large number to get all results
        sortBy,
        sortDir,
      });

      if (!allMatches?.data || allMatches.data.length === 0) {
        toast.error('No matching records to export.', { id: 'export' });
        return;
      }

      // Format data for sheet
      const formatted = allMatches.data.map(m => ({
        'Member ID': m.member_id,
        'Name': m.name,
        'Mobile': m.mobile,
        'DOB': m.dob,
        'Designation': m.designation,
        'Status': m.status.toUpperCase(),
        'Joining Date': m.joining_date,
        'Valid Until': m.valid_until,
        'District': m.district,
        'Taluk': m.taluk,
        'Village': m.village,
        'Address': m.address,
        'Aadhar Number': m.aadhar_number,
        'Blood Group': m.blood_group,
        'Vehicle Number': m.vehicle_number,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
      XLSX.writeFile(workbook, `NNFA_Members_Export_${new Date().toISOString().slice(0,10)}.xlsx`);

      // Log activity
      await activityService.logActivity('export_report', { 
        records_count: formatted.length,
        filters: { search, district, status, designation }
      });

      toast.success(`Successfully exported ${formatted.length} member records!`, { id: 'export' });
    } catch (err) {
      toast.error('Excel export failed. Try again.', { id: 'export' });
      console.error(err);
    }
  };

  return (
    <PageWrapper
      title="Members"
      subtitle={`View and manage the farmers association members registry (${memberResults?.total || 0} total).`}
      actions={
        <Button
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => navigate('/admin/members/add')}
        >
          Add Member
        </Button>
      }
    >
      {/* Search and Quick Filters */}
      <Card className="mb-6" padding="p-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by Name, Member ID, Phone, Village..."
                leftIcon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                leftIcon={<Filter className="w-4 h-4" />}
                rightIcon={showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              <Button 
                variant="secondary" 
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleExportExcel}
              >
                Export
              </Button>
              {(search || district || status || designation) && (
                <Button variant="ghost" onClick={handleClearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100 dark:border-slate-700/50 page-enter">
              {/* District Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">District</label>
                <select
                  value={district}
                  onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                >
                  <option value="">All Districts</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Designation Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</label>
                <select
                  value={designation}
                  onChange={(e) => { setDesignation(e.target.value); setPage(1); }}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                >
                  <option value="">All Designations</option>
                  {DESIGNATIONS.map(des => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                >
                  <option value="">All Statuses</option>
                  {MEMBER_STATUS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table & Results */}
      {isLoading ? (
        <LoadingSkeleton type="table" rows={limit} />
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-900/30">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Error loading registry</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please retry or check system logs.</p>
        </div>
      ) : !memberResults?.data || memberResults.data.length === 0 ? (
        <Card>
          <EmptyState
            title="No members registered"
            description="No matching farmer members found in the association records."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <Card padding="p-0" className="overflow-hidden">
            <div className="overflow-x-auto relative">
              {isFetching && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500 animate-pulse" />
              )}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <th 
                      onClick={() => handleSort('member_id')}
                      className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      Member ID {sortBy === 'member_id' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      Name {sortBy === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Location</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Mobile</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Designation</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                    <th 
                      onClick={() => handleSort('valid_until')}
                      className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    >
                      Valid Until {sortBy === 'valid_until' && (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {memberResults.data.map((member) => (
                    <tr 
                      key={member.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-6 py-4 font-mono text-green-600 dark:text-green-400 font-medium text-xs">
                        {member.member_id}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {member.name}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{member.village || '—'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{member.district || '—'}</div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {member.mobile}
                      </td>

                      {/* Designation */}
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {member.designation || 'Member'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant[member.status]} dot size="sm">
                          {member.status.toUpperCase()}
                        </Badge>
                      </td>

                      {/* Valid Until */}
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(member.valid_until)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/members/${member.id}`)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-green-200 text-gray-400 hover:text-green-600 dark:border-slate-700 dark:hover:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/members/${member.id}/edit`)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-green-200 text-gray-400 hover:text-green-600 dark:border-slate-700 dark:hover:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                            title="Edit record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteClick(member)}
                              className="p-1.5 rounded-lg border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-600 dark:border-slate-700 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {memberResults.total_pages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={memberResults.total_pages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isSuperAdmin && (
        <Dialog.Confirm
          isOpen={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedMember(null);
          }}
          title="Delete Member Profile"
          message={selectedMember ? `Are you sure you want to permanently delete the profile for "${selectedMember.name}" (${selectedMember.member_id})? All associated renewal data will be lost. This action cannot be undone.` : ''}
          confirmText="Delete Record"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </PageWrapper>
  );
}
