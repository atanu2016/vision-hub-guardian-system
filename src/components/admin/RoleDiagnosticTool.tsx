
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/auth';

export function RoleDiagnosticTool() {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { user } = useAuth();
  
  const runDiagnostic = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get role from direct database query
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
        
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      // Get session and user info
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      setUserInfo({
        databaseRole: roleData?.role || 'none',
        roleError: roleError?.message,
        profile: profileData,
        profileError: profileError?.message,
        session: sessionData?.session ? 'active' : 'none',
        sessionError: sessionError?.message,
        email: user.email,
        id: user.id
      });
      
    } catch (err: any) {
      console.error('Diagnostic error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Run the diagnostic when the component mounts
  useState(() => {
    if (user) {
      runDiagnostic();
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Role Diagnostic Tool</CardTitle>
        <CardDescription>Diagnose user role information for the current session</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runDiagnostic} 
            disabled={loading || !user}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostic
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Diagnostic
              </>
            )}
          </Button>
          
          {userInfo && (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Current User Diagnostic</AlertTitle>
                <AlertDescription>
                  <p className="text-sm mt-2">User Email: <span className="font-medium">{userInfo.email}</span></p>
                  <p className="text-sm">User ID: <span className="font-medium">{userInfo.id}</span></p>
                  <p className="text-sm">Database Role: <span className="font-medium">{userInfo.databaseRole}</span></p>
                  <p className="text-sm">Session: <span className="font-medium">{userInfo.session}</span></p>
                </AlertDescription>
              </Alert>
              
              {userInfo.roleError && (
                <Alert variant="destructive">
                  <AlertTitle>Role Error</AlertTitle>
                  <AlertDescription>{userInfo.roleError}</AlertDescription>
                </Alert>
              )}
              
              {userInfo.databaseRole === 'none' && (
                <Alert variant="destructive">
                  <AlertTitle>No Role Record</AlertTitle>
                  <AlertDescription>
                    No role record found for this user in the database.
                    This may cause permission issues.
                  </AlertDescription>
                </Alert>
              )}
              
              {userInfo.sessionError && (
                <Alert variant="destructive">
                  <AlertTitle>Session Error</AlertTitle>
                  <AlertDescription>{userInfo.sessionError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
