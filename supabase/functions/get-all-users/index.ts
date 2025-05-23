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

    // Create a service role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a normal client to verify the user's token
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
    console.log(`User ${user.id} (${user.email || 'unknown'}) is attempting to access admin function`);

    // *** SPECIAL CASE: Always grant access to admin@home.local, auth@home.local, or operator@home.local ***
    const specialEmails = ['admin@home.local', 'auth@home.local', 'operator@home.local'];
    if (user.email && specialEmails.includes(user.email.toLowerCase())) {
      console.log(`Special account detected: ${user.email}. Granting admin access.`);
    } else {
      // For regular accounts, check if user has admin privileges via the view
      const { data: viewUser, error: viewError } = await supabaseAdmin
        .from('vw_all_users')
        .select('role, is_admin')
        .eq('id', user.id)
        .maybeSingle();
      
      let isAdmin = false;
      
      if (!viewError && viewUser) {
        isAdmin = viewUser.is_admin === true || viewUser.role === 'superadmin' || viewUser.role === 'admin';
      }
      
      if (!isAdmin) {
        console.log(`User ${user.id} denied access: not an admin`);
        return new Response(JSON.stringify({ error: 'Permission denied' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        });
      }
    }

    console.log(`Admin access granted to ${user.email || 'unknown'}`);

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
        
        console.log(`Attempting to delete user: ${userId}`);
        
        // First delete profile directly with service role client to bypass RLS
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', userId);
          
        if (profileError) {
          console.error("Error deleting user profile:", profileError);
          // Continue anyway, as we'll try to delete the auth user
        } else {
          console.log(`Successfully deleted profile for user: ${userId}`);
        }
        
        // Delete any user roles
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
          
        if (roleError) {
          console.error("Error deleting user roles:", roleError);
          // Continue anyway
        } else {
          console.log(`Successfully deleted roles for user: ${userId}`);
        }
        
        // Delete the user with admin API
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
          console.error("Error deleting auth user:", error);
          throw error;
        }
        
        console.log(`Successfully deleted auth user: ${userId}`);
        
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
    
    // Handle PUT request for role updates
    if (req.method === 'PUT') {
      try {
        const body = await req.json();
        const { userId, action, newRole, mfaRequired } = body;
        
        // Handle role update
        if (action === 'update_role' && userId && newRole) {
          console.log(`Setting role to ${newRole} for user ${userId}`);
          
          // Use the admin client to bypass RLS policies
          const { error: updateError } = await supabaseAdmin
            .from('user_roles')
            .upsert({
              user_id: userId,
              role: newRole,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            
          if (updateError) {
            console.error("Error updating user role:", updateError);
            throw updateError;
          }
          
          console.log(`Successfully set role to ${newRole} for user: ${userId}`);
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }
        
        // Handle MFA requirement toggle
        if (action === 'toggle_mfa_requirement' && userId !== undefined && mfaRequired !== undefined) {
          console.log(`Setting MFA requirement to ${mfaRequired} for user ${userId}`);
          
          // Use the admin client to bypass RLS policies
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              mfa_required: mfaRequired
            })
            .eq('id', userId);
            
          if (updateError) {
            console.error("Error updating profile MFA requirement:", updateError);
            throw updateError;
          }
          
          console.log(`Successfully set MFA requirement to ${mfaRequired} for user: ${userId}`);
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }
        
        // Handle MFA revocation
        if (action === 'revoke_mfa') {
          console.log(`Revoking MFA for user ${userId}`);
          
          // Update profile to clear MFA enrollment using admin client to bypass RLS
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              mfa_enrolled: false,
              mfa_secret: null
            })
            .eq('id', userId);
            
          if (updateError) {
            console.error("Error updating profile MFA status:", updateError);
            throw updateError;
          }
          
          console.log(`Successfully revoked MFA for user: ${userId}`);
          
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
      try {
        // Call our new function that bypasses RLS
        const { data: usersData, error: funcError } = await supabaseAdmin
          .rpc('get_all_users_bypass_rls');
          
        if (funcError) {
          console.error("Error using bypass function:", funcError);
          // Fallback to the view
          const { data: viewUsers, error: viewError } = await supabaseAdmin
            .from('vw_all_users')
            .select('*');
            
          if (viewError) {
            throw viewError;
          }
          
          console.log(`Successfully returning ${viewUsers.length} users from view`);
          return new Response(JSON.stringify(viewUsers), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          });
        }

        console.log(`Successfully returning ${usersData.length} users with roles`);
        
        return new Response(JSON.stringify(usersData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
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
