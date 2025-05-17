
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Check if it's a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 405 
      });
    }

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Required environment variables are missing");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token and check if user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Log user attempting to access admin function
    console.log(`User ${user.id} (${user.email}) is attempting to access admin function`);

    // Check if user is admin or superadmin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = userRole && (userRole.role === 'admin' || userRole.role === 'superadmin');
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (!profile || !profile.is_admin) {
        console.log(`User ${user.id} denied access: not an admin`);
        return new Response(JSON.stringify({ error: 'Permission denied' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        });
      }
    }

    console.log(`Admin access granted to ${user.email}`);

    // Get users from the Auth API
    const { data: authData, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      throw authUsersError;
    }

    // Now fetch profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      throw profileError;
    }

    // Create a map of profiles by ID for faster lookup
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Fetch user roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    // Create a map of roles by user ID
    const rolesMap = (userRoles || []).reduce((acc, item) => {
      acc[item.user_id] = item.role;
      return acc;
    }, {} as Record<string, string>);

    // Combine the data
    const usersData = authData.users.map(user => {
      const profile = profilesMap[user.id] || {
        full_name: null,
        mfa_enrolled: false,
        mfa_required: false,
        is_admin: false
      };
      
      // Determine role from either role table or is_admin flag
      let role = 'user';
      if (rolesMap[user.id]) {
        role = rolesMap[user.id];
      } else if (profile.is_admin) {
        role = 'admin';
      }

      return {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        mfa_enrolled: profile.mfa_enrolled,
        mfa_required: profile.mfa_required,
        created_at: profile.created_at || user.created_at,
        auth_created_at: user.created_at,
        is_admin: profile.is_admin,
        role: role
      };
    });

    console.log(`Successfully returning ${usersData.length} users`);
    
    return new Response(JSON.stringify(usersData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error("Error in get-all-users function:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
