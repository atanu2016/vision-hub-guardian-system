
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const resetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export const ResetPasswordForm = () => {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  const handleSubmit = async (values: z.infer<typeof resetSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await resetPassword(values.email);
      setEmailSent(true);
      toast.success('Password reset email sent successfully');
    } catch (error: any) {
      console.error('Reset password error:', error);
      // Error toast is already shown in resetPassword function
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="mail@example.com" 
                    className="pl-9" 
                    {...field}
                    disabled={isSubmitting || emailSent} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {emailSent ? (
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-900">
            <p className="text-green-800 dark:text-green-300 text-sm">
              Reset link sent! Please check your email inbox.
            </p>
          </div>
        ) : (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset email...
              </>
            ) : (
              'Reset password'
            )}
          </Button>
        )}
      </form>
    </Form>
  );
};
