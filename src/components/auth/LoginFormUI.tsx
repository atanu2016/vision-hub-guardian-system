
import { z } from 'zod';
import { Loader2, InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormUIProps = {
  onSubmit: (values: z.infer<typeof loginSchema>) => void;
  isSubmitting: boolean;
  defaultValues?: {
    email: string;
    password: string;
  };
  buttonText?: string;
};

export const LoginFormUI = ({ 
  onSubmit, 
  isSubmitting, 
  defaultValues = { email: 'admin@example.com', password: 'admin123' },
  buttonText = 'Log in'
}: LoginFormUIProps) => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="mail@example.com" {...field} />
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
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            buttonText
          )}
        </Button>
        
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>Default login: admin@example.com / admin123</p>
        </div>
      </form>
    </Form>
  );
};

export const FirebaseErrorAlert = ({ error }: { error: string | null }) => {
  if (!error) return null;

  return (
    <Alert className="mb-6 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Firebase Connection Error</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{error}</p>
        <p className="text-sm">You can use the local admin account below:</p>
        <ul className="text-sm list-disc list-inside mt-1">
          <li>Email: admin@example.com</li>
          <li>Password: admin123</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export const ExistingUsersAlert = ({ 
  existingUsers, 
  onMakeAdmins, 
  isSubmitting 
}: { 
  existingUsers: Array<{email: string, id: string}>;
  onMakeAdmins: () => void;
  isSubmitting: boolean;
}) => {
  if (existingUsers.length === 0) return null;

  return (
    <Alert className="mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Found {existingUsers.length} existing users</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col">
          <p className="mb-2 text-sm">Make all users superadmins to ensure you can login:</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onMakeAdmins}
            disabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              'Make All Users Superadmins'
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const CreateAdminNotice = () => (
  <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-800 dark:text-amber-300">
    <h3 className="text-sm font-medium">Create First Admin Account</h3>
    <p className="text-xs mt-1">No users found. Create a superadmin account to get started.</p>
  </div>
);
