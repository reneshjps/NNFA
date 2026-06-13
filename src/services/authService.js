import { supabase } from '../lib/supabase';

export const adminAuth = {
  /**
   * Log in an administrator
   * @param {string} email 
   * @param {string} password 
   */
  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data?.user) throw new Error('No user returned from login');

    // Fetch the admin profile
    const { data: profile, error: profileError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      // If no admin profile exists, sign them out immediately
      await supabase.auth.signOut();
      throw new Error('This account is not registered as an administrator.');
    }

    if (profile.status === 'disabled') {
      await supabase.auth.signOut();
      throw new Error('Your administrator account has been disabled.');
    }

    return {
      user: data.user,
      profile,
      session: data.session,
    };
  },

  /**
   * Log out the current administrator
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Update the current admin's password
   * @param {string} newPassword 
   */
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};

export const memberAuth = {
  /**
   * Verify member credentials (mobile + DOB)
   * @param {string} mobile 
   * @param {string} dob 
   */
  async login(mobile, dob) {
    const { data: member, error } = await supabase
      .rpc('member_login_public', {
        p_mobile: mobile,
        p_dob: dob,
      })
      .maybeSingle();

    if (error) throw error;
    if (!member) {
      throw new Error('No member found with the provided mobile number and date of birth.');
    }

    if (member.status === 'suspended') {
      throw new Error('Your membership has been suspended. Please contact the administrator.');
    }

    return member;
  },
};
