
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/admin';
import { useCreateUser } from '@/hooks/useCreateUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateUserFormProps {
  onCancel: () => void;
}

export function CreateUserForm({ onCancel }: CreateUserFormProps) {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  
  const { 
    formData, 
    handleChange, 
    handleSubmit: submitForm, 
    isSubmitting,
    validationErrors
  } = useCreateUser({
    onSuccess: () => {
      toast.success("User created successfully");
      // Navigate to user management page after success
      navigate('/admin');
    },
    onError: (error) => {
      setFormError(error);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    submitForm(e);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="user@example.com"
          required
          className={validationErrors.email ? "border-red-500" : ""}
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm">{validationErrors.email}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="••••••••"
          required
          className={validationErrors.password ? "border-red-500" : ""}
        />
        {validationErrors.password && (
          <p className="text-red-500 text-sm">{validationErrors.password}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          placeholder="••••••••"
          required
          className={validationErrors.confirmPassword ? "border-red-500" : ""}
        />
        {validationErrors.confirmPassword && (
          <p className="text-red-500 text-sm">{validationErrors.confirmPassword}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">User Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleChange('role', value as UserRole)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Superadmin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="mfaRequired" className="flex-grow">
          Require MFA Authentication
        </Label>
        <Switch
          id="mfaRequired"
          checked={formData.mfaRequired}
          onCheckedChange={(checked) => handleChange('mfaRequired', checked)}
        />
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
