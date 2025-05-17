
import { useEffect, useState } from 'react';
import { useRoleFixer } from '@/hooks/useRoleFixer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserRole } from '@/types/admin';
import { toast } from 'sonner';

export function RoleFixerTool() {
  const { diagnoseRoles, fixUserRole, isLoading, diagnosticData } = useRoleFixer();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  useEffect(() => {
    diagnoseRoles();
  }, []);

  const handleRoleFix = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }
    
    await fixUserRole(selectedUserId, selectedRole);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Management Tool
        </CardTitle>
        <CardDescription>
          Diagnose and fix user role issues in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {!isLoading && !diagnosticData && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No diagnostic data</AlertTitle>
            <AlertDescription>
              Failed to load user role diagnostics. Please try again.
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => diagnoseRoles()}
              >
                Retry Diagnosis
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoading && diagnosticData && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline">Total Users: {diagnosticData.totalUsers}</Badge>
              <Badge variant="outline">Users with Roles: {diagnosticData.usersWithRoles}</Badge>
              <Badge variant="outline">Users without Roles: {diagnosticData.usersWithoutRoles}</Badge>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Fix User Role</h3>
              <div className="flex gap-2 items-end">
                <div className="grid gap-1 flex-1">
                  <label className="text-sm text-muted-foreground">Select User</label>
                  <Select 
                    value={selectedUserId || ''}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {diagnosticData.diagnosticInfo.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} ({user.currentRole})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1">
                  <label className="text-sm text-muted-foreground">Set Role</label>
                  <Select 
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superadmin">Superadmin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleRoleFix}
                  disabled={!selectedUserId || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fixing...
                    </>
                  ) : 'Fix Role'}
                </Button>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Has Role Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnosticData.diagnosticInfo.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.currentRole}</TableCell>
                    <TableCell>
                      {user.hasRoleRecord ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => diagnoseRoles()}
              disabled={isLoading}
            >
              Refresh Diagnostics
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
