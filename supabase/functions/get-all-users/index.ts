
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
      console.error("No authorization header provided");
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

    // Check if user has admin privileges - first check user_roles
    const { data: userRole, error: roleError1 } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    let isAdmin = false;
    
    // Check if user has admin role from user_roles
    if (!roleError1 && userRole && (userRole.role === 'admin' || userRole.role === 'superadmin')) {
      isAdmin = true;
      console.log(`User ${user.id} has admin role: ${userRole.role}`);
    } else {
      // If no role or error, check is_admin flag in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!profileError && profile && profile.is_admin) {
        isAdmin = true;
        console.log(`User ${user.id} has is_admin flag in profile`);
      }
    }

    // Special case for admin@home.local
    if (user.email === 'admin@home.local') {
      isAdmin = true;
      console.log(`User is admin@home.local, granting access`);
    }
    
    if (!isAdmin) {
      console.log(`User ${user.id} denied access: not an admin`);
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    console.log(`Admin access granted to ${user.email}`);

    // Get users from the Auth API with the service role
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error("Error fetching auth users:", authUsersError);
      throw authUsersError;
    }

    // Fetch profiles for additional user information
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');
    
    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      throw profileError;
    }

    // Create a map of profiles by ID for faster lookup
    const profilesMap = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Fetch user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
    }

    // Create a map of roles by user ID
    const rolesMap = (userRoles || []).reduce((acc, item) => {
      acc[item.user_id] = item.role;
      return acc;
    }, {} as Record<string, string>);

    // Combine the data - ensure users is actually accessible
    const users = authUsers?.users || [];
    console.log(`Found ${users.length} auth users`);
    
    // Map the users to include profile and role information
    const usersData = users.map(user => {
      const profile = profilesMap[user.id] || {
        full_name: null,
        mfa_enrolled: false,
        mfa_required: false,
        is_admin: false,
        created_at: user.created_at
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
        mfa_enrolled: profile.mfa_enrolled || false,
        mfa_required: profile.mfa_required || false,
        created_at: profile.created_at || user.created_at,
        auth_created_at: user.created_at,
        is_admin: profile.is_admin || false,
        role: role
      };
    });

    console.log(`Successfully returning ${usersData.length} users with roles`);
    
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
