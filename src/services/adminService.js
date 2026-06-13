import { supabase } from '../lib/supabase';

export const adminService = {
  async getAdmins() {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateAdminStatus(id, status) {
    const { data, error } = await supabase
      .from('admins')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async updateAdminRole(id, role) {
    const { data, error } = await supabase
      .from('admins')
      .update({ role })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async createAdminAccount(profileData) {
    const { data, error } = await supabase.rpc('create_admin_account', {
      p_email: profileData.email,
      p_password: profileData.password,
      p_name: profileData.name,
      p_phone: profileData.phone,
      p_role: profileData.role,
    });

    if (error) throw error;
    return data;
  },

  async updateAdminProfile(id, profileData) {
    const { data, error } = await supabase
      .from('admins')
      .update(profileData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAdmin(id) {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};
