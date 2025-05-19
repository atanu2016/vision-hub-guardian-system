
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/contexts/auth/types';

export function useProfileData() {
  const { user, profile, role: authRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [role, setRole] = useState<UserRole>('user');
  
  // Set initial data from auth context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        fullName: profile?.full_name || '',
      }));
      
      setRole(authRole);
      setLoading(false);
    } else if (!user) {
      // Only set loading to false if auth is done loading and user is still null
      setLoading(false);
    }
  }, [user, profile, authRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    user,
    loading,
    formData,
    role,
    handleInputChange
  };
}
