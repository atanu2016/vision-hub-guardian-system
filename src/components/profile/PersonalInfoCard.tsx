
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@/types/admin";

// Function to get role display name with proper capitalization
const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'superadmin': return 'Superadmin';
    case 'admin': return 'Admin';
    case 'operator': return 'Operator';
    case 'user': return 'User';
    default: return 'User';
  }
};

export function PersonalInfoCard() {
  const { 
    fullName, 
    email, 
    userRole,
    isLoading, 
    isSaving, 
    setFullName, 
    handleSaveChanges 
  } = useProfileSettings();
  
  const [isEditingName, setIsEditingName] = useState(false);
  
  const toggleEdit = () => {
    setIsEditingName(!isEditingName);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveChanges();
    setIsEditingName(false);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={fullName} />
              <AvatarFallback className="text-lg">
                {isLoading ? <Skeleton className="h-full w-full" /> : getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <div className="font-semibold text-lg">{fullName || 'Not set'}</div>
                )}
                {!isLoading && !isEditingName && (
                  <Button variant="ghost" type="button" size="sm" onClick={toggleEdit}>
                    Edit
                  </Button>
                )}
              </div>
              
              {isLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <div className="text-sm text-muted-foreground">{email}</div>
              )}
            </div>
          </div>
          
          {isEditingName && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="space-y-2 pt-2">
            <Label>User Role</Label>
            <div className="p-2 border rounded-md bg-muted/50">
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <div>{getRoleDisplayName(userRole)}</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your account role determines what actions you can perform in the system.
            </p>
          </div>
          
          {isEditingName && (
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={toggleEdit}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
