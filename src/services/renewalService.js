import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';

const renewalLabels = {
  '1_year': '1 Year',
  '3_years': '3 Years',
  lifetime: 'Lifetime',
};

export const renewalService = {
  renewalLabels,

  async getRenewals({ search = '', page = 1, limit = 20 } = {}) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const renewalFilters = [];

    if (search) {
      const { data: matchedMembers, error: memberSearchError } = await supabase
        .from('members')
        .select('id')
        .or(`name.ilike.%${search}%,member_id.ilike.%${search}%,mobile.ilike.%${search}%`)
        .limit(1000);

      if (memberSearchError) throw memberSearchError;

      renewalFilters.push(`renewal_type.ilike.%${search}%`);
      if (matchedMembers?.length) {
        renewalFilters.push(`member_id.in.(${matchedMembers.map((member) => member.id).join(',')})`);
      }
    }

    let query = supabase
      .from('renewals')
      .select(
        '*, member:members(id, member_id, name, mobile, village, district, designation, valid_until, status)',
        { count: 'exact' }
      )
      .order('renewed_on', { ascending: false })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (renewalFilters.length) {
      query = query.or(renewalFilters.join(','));
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data,
      total: count || 0,
      total_pages: Math.max(1, Math.ceil((count || 0) / limit)),
    };
  },

  async getMemberRenewals(memberId) {
    if (!memberId) return [];

    const { data, error } = await supabase
      .from('renewals')
      .select('*')
      .eq('member_id', memberId)
      .order('renewed_on', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async renewMembership({ member, renewalType, amount }) {
    if (!member?.id) throw new Error('Select a member before renewing.');
    if (!renewalType) throw new Error('Select a renewal type.');

    const start = dayjs();
    let end;
    if (renewalType === '1_year') end = start.add(1, 'year');
    else if (renewalType === '3_years') end = start.add(3, 'years');
    else if (renewalType === 'lifetime') end = start.add(100, 'years');
    
    const newValidUntil = end.format('YYYY-MM-DD');

    // 1. Create the renewal log
    const { data: renewalData, error: renewalError } = await supabase
      .from('renewals')
      .insert({
        member_id: member.id,
        renewed_on: start.format('YYYY-MM-DD'),
        valid_until: newValidUntil,
        renewal_type: renewalType,
        amount: amount ? Number(amount) : null,
      })
      .select('*')
      .single();

    if (renewalError) throw renewalError;

    // 2. Update member profile status and valid_until
    const { error: memberError } = await supabase
      .from('members')
      .update({
        valid_until: newValidUntil,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id);

    if (memberError) {
      console.error('Failed to update member after renewal:', memberError);
      throw new Error('Renewal logged, but failed to update member expiry date.');
    }

    return renewalData;
  },
};
