
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS, GET',
};

// Handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
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
      
      // Ensure this user has admin rights in database
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: 'Administrator',
          is_admin: true,
          mfa_required: false
        });
        
      // Also ensure superadmin role
      await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'superadmin'
        });
    }
    
    if (!isAdmin) {
      console.log(`User ${user.id} denied access: not an admin`);
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }

    console.log(`Admin access granted to ${user.email}`);

    // Handle DELETE request to delete a user
    if (req.method === 'DELETE') {
      try {
        // Parse the request body to get userId
        const body = await req.json();
        const userId = body.userId;
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'User ID is required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
        
        // Delete the user with admin API
        const { error } = await supabase.auth.admin.deleteUser(userId);
        
        if (error) {
          console.error("Error deleting user:", error);
          throw error;
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (error) {
        console.error("Error in user deletion:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to delete user' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }
    
    // Handle PUT request for MFA operations
    if (req.method === 'PUT') {
      try {
        const body = await req.json();
        const { userId, action } = body;
        
        if (!userId || !action) {
          return new Response(JSON.stringify({ error: 'User ID and action are required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
        
        if (action === 'revoke_mfa') {
          // Here we would remove MFA factors if using Supabase MFA directly
          // This is a placeholder for actual MFA revocation code
          console.log(`Revoking MFA for user ${userId}`);
          
          // We can implement the actual MFA factor deletion here
          // when Supabase adds support for admin MFA operations
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }
        
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      } catch (error) {
        console.error("Error in MFA operation:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to perform MFA operation' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    // Default GET method to fetch all users
    if (req.method === 'GET' || req.method === 'POST') {
      // Use the built-in function to get users safely
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, mfa_enrolled, mfa_required, created_at, is_admin');

      if (usersError) {
        console.error("Error fetching profiles:", usersError);
        throw usersError;
      }

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

      // Get user emails from auth.users if permissions allow
      let emails: Record<string, string> = {};
      
      try {
        // Attempt to get user emails using admin API
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        if (authUsers && authUsers.users) {
          authUsers.users.forEach((authUser: any) => {
            if (authUser && authUser.id && authUser.email) {
              emails[authUser.id] = authUser.email;
            }
          });
        }
      } catch (err) {
        console.log("Could not fetch emails, will use placeholders");
      }

      // Map the data to include roles and emails
      const usersData = users.map(profile => {
        // Determine role from either role table or is_admin flag
        let role = 'user';
        if (rolesMap[profile.id]) {
          role = rolesMap[profile.id];
        } else if (profile.is_admin) {
          role = 'admin';
        }

        return {
          id: profile.id,
          email: emails[profile.id] || 'Email hidden', 
          full_name: profile.full_name || 'User',
          mfa_enrolled: profile.mfa_enrolled || false,
          mfa_required: profile.mfa_required || false,
          created_at: profile.created_at || new Date().toISOString(),
          is_admin: profile.is_admin || false,
          role: role
        };
      });

      console.log(`Successfully returning ${usersData.length} users with roles`);
      
      return new Response(JSON.stringify(usersData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // Handle unsupported methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    });

  } catch (error) {
    console.error("Error in get-all-users function:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
