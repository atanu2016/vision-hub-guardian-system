
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

    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Required environment variables are missing");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }

    // Admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Client to verify user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      });
    }

    // Log request details
    console.log(`Role fix request from user ${user.id} (${user.email || 'unknown'})`);
    
    // Parse the request body
    const requestData = await req.json();
    const { action, userId, role } = requestData;
    
    // Verify user is admin or superadmin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
      
    const isAdmin = userRole?.role === 'admin' || userRole?.role === 'superadmin';
    
    // Special case for test accounts
    const isSpecialAccount = user.email === 'admin@home.local' || 
                          user.email === 'auth@home.local' ||
                          user.email === 'test@home.local';
    
    if (!isAdmin && !isSpecialAccount) {
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      });
    }
    
    // Handle the action
    if (action === 'diagnose') {
      // Get all users
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id');
        
      if (profileError) {
        throw new Error(`Error fetching profiles: ${profileError.message}`);
      }
      
      // Get all role records
      const { data: roles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*');
        
      if (rolesError) {
        throw new Error(`Error fetching roles: ${rolesError.message}`);
      }
      
      // Get auth user emails (if possible)
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      // Map userIds to emails
      const emailMap: Record<string, string> = {};
      if (!authError && authUsers) {
        authUsers.users.forEach((user: any) => {
          if (user && user.id && user.email) {
            emailMap[user.id] = user.email;
          }
        });
      }
      
      // Create role map for quick lookup
      const roleMap: Record<string, any> = {};
      roles.forEach((role: any) => {
        if (role && role.user_id) {
          roleMap[role.user_id] = role;
        }
      });
      
      // Generate diagnostic info
      const diagnosticInfo = profiles.map((profile: any) => {
        const userId = profile.id;
        const hasRoleRecord = !!roleMap[userId];
        
        return {
          id: userId,
          email: emailMap[userId] || userId,
          roleRecord: roleMap[userId] || null,
          hasRoleRecord,
          currentRole: hasRoleRecord ? roleMap[userId].role : 'user'
        };
      });
      
      return new Response(JSON.stringify({
        success: true,
        diagnosticInfo,
        totalUsers: profiles.length,
        usersWithRoles: Object.keys(roleMap).length,
        usersWithoutRoles: profiles.length - Object.keys(roleMap).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    else if (action === 'fix' && userId && role) {
      // Ensure role is valid - make sure 'observer' is included here
      const validRoles = ['user', 'admin', 'superadmin', 'observer']; 
      if (!validRoles.includes(role)) {
        return new Response(JSON.stringify({ error: `Invalid role: ${role}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }
      
      console.log(`Attempting to update role for user ${userId} to ${role}`);
      
      try {
        // Force delete any existing role first to avoid conflicts
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
          
        // Then insert the new role
        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error updating role:', insertError);
          throw insertError;
        }
        
        console.log(`Successfully updated role for user ${userId} to ${role}`);
        
        // Send a notification through another channel
        try {
          console.log(`Notified about role change for user ${userId}`);
          
          // Update the record again to trigger realtime notifications
          await supabaseAdmin
            .from('user_roles')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', userId);
            
        } catch(e) {
          console.error('Error sending notification:', e);
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `User role updated to ${role}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ 
          error: `Failed to update role: ${error.message || 'Unknown error'}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action or missing parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
  } catch (error: any) {
    console.error('Error in fix-user-roles function:', error);
    return new Response(JSON.stringify({ 
      error: `Server error: ${error.message || 'Unknown error'}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
