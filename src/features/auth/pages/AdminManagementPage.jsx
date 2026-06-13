import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldAlert, UserPlus, ToggleLeft, ToggleRight, Trash2, Mail, Phone, User, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { activityService } from '../../../services/activityService';
import { useAuthStore } from '../../../store/authStore';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Dialog from '../../../components/ui/Dialog';
import PageWrapper from '../../../components/layout/PageWrapper';
import LoadingSkeleton from '../../../components/feedback/LoadingSkeleton';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../../utils/helpers';

export default function AdminManagementPage() {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin',
    password: '',
  });

  const adminsQuery = useQuery({
    queryKey: ['admins'],
    queryFn: adminService.getAdmins,
  });

  const admins = adminsQuery.data || [];

  const handleStatusToggle = async (admin) => {
    if (admin.id === currentUser?.id) {
      toast.error('You cannot disable your own account!');
      return;
    }

    const newStatus = admin.status === 'active' ? 'disabled' : 'active';
    try {
      await adminService.updateAdminStatus(admin.id, newStatus);
      
      // Update local state
      queryClient.setQueryData(['admins'], admins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
      
      // Log activity
      await activityService.logActivity(
        newStatus === 'disabled' ? 'disable_admin' : 'enable_admin',
        { admin_id: admin.id, email: admin.email }
      );

      toast.success(`Administrator ${admin.name} has been ${newStatus === 'active' ? 'activated' : 'disabled'}.`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleRoleChange = async (admin, newRole) => {
    if (admin.id === currentUser?.id) {
      toast.error('You cannot change your own role!');
      return;
    }

    try {
      await adminService.updateAdminRole(admin.id, newRole);
      
      // Update local state
      queryClient.setQueryData(['admins'], admins.map(a => a.id === admin.id ? { ...a, role: newRole } : a));

      // Log activity
      await activityService.logActivity('change_admin_role', {
        admin_id: admin.id,
        email: admin.email,
        new_role: newRole,
      });

      toast.success(`Role for ${admin.name} updated to ${newRole === 'super_admin' ? 'Super Admin' : 'Admin'}.`);
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
      };

      toast.loading('Creating admin account...', { id: 'create-admin' });

      const newAdmin = await adminService.createAdminAccount(dataToSave);
      
      // Log activity
      await activityService.logActivity('create_admin', {
        email: formData.email,
        role: formData.role,
      });

      toast.success(`Admin account for ${formData.name} created successfully!`, { id: 'create-admin' });
      queryClient.setQueryData(['admins'], [newAdmin, ...admins]);
      setIsCreateOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'admin',
        password: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to create administrator profile', { id: 'create-admin' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;
    if (selectedAdmin.id === currentUser?.id) {
      toast.error('You cannot delete your own account!');
      return;
    }

    try {
      await adminService.deleteAdmin(selectedAdmin.id);
      
      // Log activity
      await activityService.logActivity('delete_admin', {
        admin_id: selectedAdmin.id,
        email: selectedAdmin.email,
      });

      toast.success(`Administrator ${selectedAdmin.name} deleted.`);
      queryClient.setQueryData(['admins'], admins.filter(a => a.id !== selectedAdmin.id));
      setIsDeleteOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      toast.error('Failed to delete administrator');
      console.error(error);
    }
  };

  return (
    <PageWrapper
      title="Admin Management"
      subtitle="Manage administrator accounts, control system roles, and revoke association access privileges."
      actions={
        <Button
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Create Admin Account
        </Button>
      }
    >
      {adminsQuery.isLoading ? (
        <LoadingSkeleton type="table" rows={4} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Administrator Details</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Contact Details</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">System Role</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Created At</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {admins.map((admin) => {
                  const isSelf = admin.id === currentUser?.id;
                  
                  return (
                    <tr 
                      key={admin.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Name / Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center border border-green-500/30">
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                              {admin.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                              {admin.name}
                              {isSelf && (
                                <Badge variant="info" size="xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {admin.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {admin.email}
                          </div>
                          {admin.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* System Role Selection */}
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {admin.role === 'super_admin' ? (
                              <ShieldAlert className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-500" />
                            )}
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </div>
                        ) : (
                          <select
                            value={admin.role}
                            onChange={(e) => handleRoleChange(admin, e.target.value)}
                            disabled={admin.status === 'disabled'}
                            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <Badge 
                          variant={admin.status === 'active' ? 'success' : 'danger'}
                          leftIcon={admin.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        >
                          {admin.status === 'active' ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(admin.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle status */}
                          {!isSelf && (
                            <button
                              onClick={() => handleStatusToggle(admin)}
                              title={admin.status === 'active' ? 'Disable Account' : 'Enable Account'}
                              className={`p-1.5 rounded-lg border transition-all ${
                                admin.status === 'active'
                                  ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10'
                                  : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/10'
                              }`}
                            >
                              {admin.status === 'active' ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                          )}

                          {/* Delete profile */}
                          {!isSelf && (
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete Administrator Profile"
                              className="p-1.5 rounded-lg border border-gray-200 hover:border-red-200 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:border-slate-700 dark:hover:border-red-900/30 dark:hover:bg-red-900/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Administrator Account"
        size="md"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            leftIcon={<User className="w-4 h-4" />}
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@nnfa.in"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            placeholder="10-digit number"
            leftIcon={<Phone className="w-4 h-4" />}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Temporary Password"
            type="password"
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              System Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <option value="admin">Administrator (Standard Access)</option>
              <option value="super_admin">Super Administrator (Full Access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog.Confirm
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedAdmin(null);
        }}
        title="Delete Administrator Profile"
        message={selectedAdmin ? `Are you sure you want to delete the administrator profile for "${selectedAdmin.name}" (${selectedAdmin.email})? This action cannot be undone.` : ''}
        confirmText="Delete Admin"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </PageWrapper>
  );
}
