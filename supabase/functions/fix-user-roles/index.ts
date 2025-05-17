
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
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
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Create a service role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a normal client to verify the user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Check if the user is a superadmin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole || userRole.role !== 'superadmin') {
      console.log('User role check failed:', roleError);
      console.log('User role data:', userRole);
      return new Response(JSON.stringify({ error: 'Only superadmins can fix user roles' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }
    
    // Get request data
    const { userId, role, action } = await req.json();
    
    if (action === 'fix') {
      const targetUserId = userId || null;
      
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Check if user exists in auth
      const { data: targetUser, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      
      if (targetUserError || !targetUser) {
        return new Response(JSON.stringify({ error: 'Target user not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }
      
      // Fix the user role
      const newRole = role || 'user';
      
      // Validate the role is one of the accepted values
      const validRoles = ['user', 'operator', 'admin', 'superadmin', 'monitoringOfficer'];
      if (!validRoles.includes(newRole)) {
        return new Response(JSON.stringify({ error: 'Invalid role value. Must be one of: ' + validRoles.join(', ') }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      // Special case for user@home.local - always ensure it's a monitoring officer
      const { data: userData, error: userDataError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      if (!userDataError && userData && userData.user && userData.user.email === 'user@home.local' && newRole !== 'monitoringOfficer') {
        console.log('Warning: user@home.local should be a monitoringOfficer, but received role:', newRole);
        console.log('Overriding to monitoringOfficer');
      }
      
      // Insert or update the role
      const { error: upsertError } = await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: targetUserId,
          role: userData?.user?.email === 'user@home.local' ? 'monitoringOfficer' : newRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (upsertError) {
        console.error('Error upserting role:', upsertError);
        return new Response(JSON.stringify({ error: `Failed to update role: ${upsertError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
      // Try to notify about role change if the RPC exists
      try {
        await supabaseAdmin.rpc('notify_role_change', { user_id: targetUserId });
      } catch (error) {
        console.log('notify_role_change RPC might not exist:', error);
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `User ${targetUserId} role has been set to ${userData?.user?.email === 'user@home.local' ? 'monitoringOfficer' : newRole}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } else if (action === 'diagnose') {
      // Get all users with roles
      const { data: usersWithRoles, error: usersRolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*');
        
      if (usersRolesError) {
        return new Response(JSON.stringify({ error: `Failed to fetch user roles: ${usersRolesError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
      // Get all auth users
      const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authUsersError) {
        return new Response(JSON.stringify({ error: `Failed to fetch auth users: ${authUsersError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
      const userRoleMap = usersWithRoles?.reduce<{[key: string]: any}>((acc, role) => {
        acc[role.user_id] = role;
        return acc;
      }, {}) || {};
      
      const diagnosticInfo = authUsers.users.map(user => {
        // Special check to ensure user@home.local is monitoringOfficer
        const currentRole = userRoleMap[user.id]?.role || 'user';
        const shouldBeRole = user.email === 'user@home.local' ? 'monitoringOfficer' : currentRole;
        
        return {
          id: user.id,
          email: user.email,
          roleRecord: userRoleMap[user.id] || null,
          hasRoleRecord: !!userRoleMap[user.id],
          currentRole,
          shouldBeRole,
          roleCorrect: currentRole === shouldBeRole
        };
      });
      
      // Fix any user@home.local roles automatically
      const userHomeLocalUser = diagnosticInfo.find(u => u.email === 'user@home.local' && !u.roleCorrect);
      if (userHomeLocalUser) {
        console.log('Found user@home.local with incorrect role, fixing...');
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userHomeLocalUser.id,
            role: 'monitoringOfficer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        diagnosticInfo,
        totalUsers: authUsers.users.length,
        usersWithRoles: usersWithRoles?.length || 0,
        usersWithoutRoles: authUsers.users.length - (usersWithRoles?.length || 0),
        fixedRoles: userHomeLocalUser ? 1 : 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action. Use "fix" or "diagnose".' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
    
  } catch (error: any) {
    console.error('Error in fix-user-roles function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
