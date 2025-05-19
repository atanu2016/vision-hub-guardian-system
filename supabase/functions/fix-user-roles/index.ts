
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // Get JWT token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the user making the request
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Role fix request from user ${user.id} (${user.email})`);
    
    // Parse request body
    const { action, userId, role } = await req.json();
    
    // Handle different actions
    if (action === 'diagnose') {
      // Fetch all users and their roles
      const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (usersError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: usersError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Fetch all roles from the database
      const { data: roleRecords, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch roles', details: rolesError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Special treatment for admin@home.local - ensure it always has superadmin role
      const adminEmail = 'admin@home.local';
      const adminUser = users.users.find(u => u.email === adminEmail);
      
      if (adminUser) {
        console.log(`Found admin user: ${adminUser.id}`);
        
        // Check if admin has the superadmin role
        const adminRoleRecord = roleRecords?.find(r => r.user_id === adminUser.id);
        
        if (!adminRoleRecord || adminRoleRecord.role !== 'superadmin') {
          console.log(`Admin user doesn't have superadmin role, adding it now`);
          
          // Insert or update the admin role
          const { error: updateError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
              user_id: adminUser.id,
              role: 'superadmin',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          if (updateError) {
            console.error('Failed to update admin role:', updateError);
          } else {
            console.log('Successfully set admin user to superadmin role');
          }
        }
      }
      
      // Process results
      const diagnosticInfo = users.users.map(u => {
        const roleRecord = roleRecords?.find(r => r.user_id === u.id);
        
        return {
          id: u.id,
          email: u.email,
          roleRecord: roleRecord || null,
          hasRoleRecord: !!roleRecord,
          currentRole: roleRecord?.role || 'user'
        };
      });
      
      const usersWithRoles = diagnosticInfo.filter(u => u.hasRoleRecord);
      const usersWithoutRoles = diagnosticInfo.filter(u => !u.hasRoleRecord);
      
      return new Response(
        JSON.stringify({
          success: true,
          diagnosticInfo,
          totalUsers: users.users.length,
          usersWithRoles: usersWithRoles.length,
          usersWithoutRoles: usersWithoutRoles.length
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'fix') {
      // Special handling for admin@home.local - always ensure it has superadmin role
      const { data: adminUserData, error: adminUserError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!adminUserError && adminUserData) {
        const adminUser = adminUserData.users.find(u => u.email === 'admin@home.local');
        
        if (adminUser) {
          // Force set the admin role
          const { error: updateAdminError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
              user_id: adminUser.id,
              role: 'superadmin',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            
          if (updateAdminError) {
            console.error('Failed to update admin role:', updateAdminError);
          } else {
            console.log('Successfully ensured admin@home.local has superadmin role');
          }
        }
      }
      
      // Handle the requested role fix if specified
      if (userId && role) {
        const { error: updateError } = await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update role', details: updateError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, message: `User role updated to ${role}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Admin roles verified and fixed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
