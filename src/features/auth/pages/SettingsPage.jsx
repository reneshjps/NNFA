import { useState } from 'react';
import { User, Phone, Mail, Lock, Shield, Eye, EyeOff, Save, Check } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { adminService } from '../../../services/adminService';
import { adminAuth } from '../../../services/authService';
import { activityService } from '../../../services/activityService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import PageWrapper from '../../../components/layout/PageWrapper';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, role, setAuth } = useAuthStore();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile update handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const updatedAdmin = await adminService.updateAdminProfile(user.id, {
        name: profileData.name,
        phone: profileData.phone,
      });

      // Update auth store
      setAuth(
        {
          ...user,
          name: updatedAdmin.name,
          phone: updatedAdmin.phone,
        },
        role,
        useAuthStore.getState().session
      );

      // Log activity
      await activityService.logActivity('update_profile', {
        name: updatedAdmin.name,
        phone: updatedAdmin.phone,
      });

      toast.success('Profile details updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      console.error(error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await adminAuth.updatePassword(passwordData.newPassword);

      // Log activity
      await activityService.logActivity('change_password', {});

      toast.success('Password changed successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      console.error(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <PageWrapper
      title="Account Settings"
      subtitle="Manage your personal profile, contact information, and security preferences."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card & Role Display */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <Card.Content className="pt-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center border-2 border-green-500/30 mx-auto mb-4">
                <span className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {user?.name || 'Administrator'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {user?.email}
              </p>
              
              <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">System Role:</span>
                  <Badge variant={role === 'super_admin' ? 'info' : 'secondary'} leftIcon={<Shield className="w-3.5 h-3.5" />}>
                    {role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
                  <Badge variant="success" leftIcon={<Check className="w-3.5 h-3.5" />}>
                    Active
                  </Badge>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Right Columns: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Details */}
          <Card>
            <Card.Header>
              <Card.Title>Profile Information</Card.Title>
              <Card.Description>Update your public display name and phone number.</Card.Description>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    leftIcon={<User className="w-4 h-4" />}
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />

                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    leftIcon={<Phone className="w-4 h-4" />}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <Input
                  label="Email Address (Linked to Supabase Auth)"
                  type="email"
                  disabled
                  value={user?.email || ''}
                  leftIcon={<Mail className="w-4 h-4" />}
                  className="bg-gray-50 dark:bg-slate-800 cursor-not-allowed text-gray-500"
                />

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    isLoading={isUpdatingProfile}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header>
              <Card.Title>Security & Password</Card.Title>
              <Card.Description>Update your account password to maintain server security.</Card.Description>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />

                  <Input
                    label="Confirm New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    isLoading={isUpdatingPassword}
                    leftIcon={<Lock className="w-4 h-4" />}
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>

        </div>
      </div>
    </PageWrapper>
  );
}
