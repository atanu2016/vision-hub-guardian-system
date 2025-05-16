
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { ArrowLeft } from 'lucide-react';
import { CreateUserForm } from '@/components/admin/users/CreateUserForm';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function CreateUser() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  
  const handleNavigateBack = () => {
    navigate('/admin');
  };
  
  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error('Only superadmin users can create new users');
      navigate('/admin');
    }
  }, [isSuperAdmin, navigate]);
  
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleNavigateBack}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Add a new user to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateUserForm onCancel={handleNavigateBack} />
        </CardContent>
      </Card>
    </div>
  );
}
