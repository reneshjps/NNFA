import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export const activityService = {
  async logActivity(action, details = {}) {
    try {
      const state = useAuthStore.getState();
      const admin = state.user;

      if (!admin || (state.role !== 'admin' && state.role !== 'super_admin')) {
        return;
      }

      const { error } = await supabase.from('activity_logs').insert({
        admin_id: admin.id,
        action,
        details,
      });

      if (error) {
        console.error('Error saving activity log to Supabase:', error);
      }
    } catch (err) {
      console.error('Failed to log admin activity:', err);
    }
  },

  async getLogs({ page = 1, limit = 20, search = '' } = {}) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('activity_logs')
      .select('*, admin:admins(name, email)', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(start, end);

    if (search) {
      query = query.or(`action.ilike.%${search}%,details->>member_id.ilike.%${search}%,details->>name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data,
      count,
    };
  },
};
