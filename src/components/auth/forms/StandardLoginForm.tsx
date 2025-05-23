
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { loginSchema, LoginFormValues } from './LoginFormSchema';

interface StandardLoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  onCreateAdminClick?: () => void;
  showCreateAdminButton?: boolean;
  isLoading?: boolean;
}

export const StandardLoginForm = ({ 
  onSubmit, 
  onCreateAdminClick,
  showCreateAdminButton = false,
  isLoading: externalIsLoading = false
}: StandardLoginFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || externalIsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="mail@example.com" {...field} disabled={isLoading} />
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
                <Input type="password" placeholder="********" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Log in'
          )}
        </Button>
        {showCreateAdminButton && onCreateAdminClick && (
          <Button 
            variant="ghost" 
            type="button" 
            className="w-full" 
            onClick={onCreateAdminClick}
            disabled={isLoading}
          >
            Create Admin Account
          </Button>
        )}
      </form>
    </Form>
  );
};
