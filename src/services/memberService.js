import { supabase } from '../lib/supabase';

export const memberService = {
  async getMembers({
    search = '',
    district = '',
    status = '',
    designation = '',
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortDir = 'desc',
  } = {}) {
    const { data, error } = await supabase.rpc('search_members', {
      search_query: search,
      filter_district: district,
      filter_status: status,
      filter_designation: designation,
      page_num: page,
      page_size: limit,
      sort_by: sortBy,
      sort_dir: sortDir,
    });

    if (error) throw error;
    return data;
  },

  async getMemberById(id) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getMemberByMemberId(memberId) {
    const { data, error } = await supabase
      .rpc('verify_member_public', { p_member_id: memberId })
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Member not found');
    return data;
  },

  async createMember(memberData) {
    const payload = Object.fromEntries(
      Object.entries(memberData).filter(([, value]) => value !== undefined && value !== '')
    );

    const { data, error } = await supabase
      .from('members')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async updateMember(id, memberData) {
    const { data, error } = await supabase
      .from('members')
      .update(memberData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMember(id) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  async uploadFile(bucket, file) {
    const bucketMap = {
      photos: 'member-photos',
      signatures: 'member-signatures',
      documents: 'documents',
    };
    const storageBucket = bucketMap[bucket] || bucket;
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  async getExistingIdentifiers({ memberIds = [], mobiles = [] } = {}) {
    const normalizedMemberIds = memberIds.filter(Boolean);
    const normalizedMobiles = mobiles.filter(Boolean);

    if (!normalizedMemberIds.length && !normalizedMobiles.length) return [];

    const filters = [];
    if (normalizedMemberIds.length) {
      filters.push(`member_id.in.(${normalizedMemberIds.map((id) => `"${id}"`).join(',')})`);
    }
    if (normalizedMobiles.length) {
      filters.push(`mobile.in.(${normalizedMobiles.map((mobile) => `"${mobile}"`).join(',')})`);
    }

    const { data, error } = await supabase
      .from('members')
      .select('member_id,mobile')
      .or(filters.join(','));

    if (error) throw error;
    return data || [];
  },
};
