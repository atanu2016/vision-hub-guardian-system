
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { auth, firestore } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required')
});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: ''
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: values.fullName
      });
      
      // Add user to profiles collection
      await setDoc(doc(firestore, 'profiles', user.uid), {
        id: user.uid,
        full_name: values.fullName,
        is_admin: false,
        mfa_enrolled: false,
        mfa_required: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Add default user role
      await setDoc(doc(firestore, 'user_roles', user.uid), {
        user_id: user.uid,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      toast.success('Registration successful', {
        description: 'Your account has been created successfully.'
      });
      
      form.reset();
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@example.com" {...field} autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
