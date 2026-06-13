import { supabase } from '../lib/supabase';

export const dashboardService = {
  async getDashboardStats() {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) throw error;
    return data;
  },

  async getRecentMembers(limit = 5) {
    const { data, error } = await supabase
      .from('members')
      .select('id, member_id, name, village, district, joining_date')
      .order('joining_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
