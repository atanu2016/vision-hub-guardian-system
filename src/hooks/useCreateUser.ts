
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/admin';

interface CreateUserFormData {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  mfaRequired: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface UseCreateUserOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useCreateUser({ onSuccess, onError }: UseCreateUserOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    mfaRequired: true
  });
  
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors when field is updated
    if (field in validationErrors) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ValidationErrors];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating new user:", { 
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        mfaRequired: formData.mfaRequired
      });
      
      // First check if we have service role access
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('Authentication required to create users');
      }
      
      // Create the user through admin-create-user edge function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          user_metadata: { full_name: formData.fullName },
          role: formData.role,
          mfa_required: formData.mfaRequired
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.userId) {
        throw new Error('Failed to create user');
      }
      
      console.log("User created successfully:", data.userId);
      
      toast.success('User created successfully');
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error?.message || 'Failed to create user';
      toast.error(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    validationErrors
  };
}
