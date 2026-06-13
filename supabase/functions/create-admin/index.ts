import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Supabase function environment is not configured.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: 'You must be signed in to create administrators.' }, 401);
    }

    const { data: requester, error: requesterError } = await adminClient
      .from('admins')
      .select('id, role, status')
      .eq('id', user.id)
      .single();

    if (requesterError || requester?.role !== 'super_admin' || requester?.status !== 'active') {
      return json({ error: 'Only active super admins can create administrators.' }, 403);
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const role = body.role === 'super_admin' ? 'super_admin' : 'admin';
    const password = String(body.password || '');

    if (!name || !email || !password) {
      return json({ error: 'Name, email, and password are required.' }, 400);
    }

    if (password.length < 8) {
      return json({ error: 'Password must be at least 8 characters.' }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (createError || !created.user) {
      return json({ error: createError?.message || 'Unable to create auth user.' }, 400);
    }

    const { data: admin, error: profileError } = await adminClient
      .from('admins')
      .insert({
        id: created.user.id,
        name,
        email,
        phone,
        role,
        status: 'active',
      })
      .select('*')
      .single();

    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError.message }, 400);
    }

    return json({ admin }, 200);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error.' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
