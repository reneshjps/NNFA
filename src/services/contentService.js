import { supabase } from '../lib/supabase';

export const contentService = {
  async getEvents({ search = '' } = {}) {
    let query = supabase.from('events').select('*').order('date', { ascending: true });
    if (search) query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveEvent(eventData) {
    const payload = { ...eventData };
    delete payload.id;
    const query = eventData.id
      ? supabase.from('events').update(payload).eq('id', eventData.id)
      : supabase.from('events').insert(payload);
    const { data, error } = await query.select('*').single();
    if (error) throw error;
    return data;
  },

  async deleteEvent(id) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async getNotifications({ search = '', type = '' } = {}) {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (type) query = query.eq('type', type);
    if (search) query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async saveNotification(notificationData) {
    const payload = { ...notificationData };
    delete payload.id;
    const query = notificationData.id
      ? supabase.from('notifications').update(payload).eq('id', notificationData.id)
      : supabase.from('notifications').insert(payload);
    const { data, error } = await query.select('*').single();
    if (error) throw error;
    return data;
  },

  async deleteNotification(id) {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};
