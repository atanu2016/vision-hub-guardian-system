
// Add the missing imports if needed
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthForm } from '@/hooks/useAuthForm';
import { LoginFormSchema, LoginFormValues } from "./forms/LoginFormSchema";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { handleLogin, isLoading } = useAuthForm({ onSuccess });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [adminLoginAttempted, setAdminLoginAttempted] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  });
  
  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    
    // Check if this is the admin login
    const isAdminLogin = values.email.toLowerCase() === 'admin@home.local';
    
    if (isAdminLogin) {
      setAdminLoginAttempted(true);
    }
    
    try {
      const success = await handleLogin(values);
      
      if (success && isAdminLogin) {
        // Special handling for admin@home.local to restore admin rights
        toast.loading("Restoring admin privileges...");
        
        // Wait a bit for the login to complete
        setTimeout(async () => {
          try {
            // Get the current session
            const { data } = await supabase.auth.getSession();
            
            if (data.session) {
              // Call our edge function to restore admin rights
              const { error } = await supabase.functions.invoke('fix-user-roles', {
                body: { 
                  action: 'fix',
                  userId: data.session.user.id,
                  role: 'superadmin'
                }
              });
              
              if (error) {
                console.error("Failed to restore admin rights:", error);
                toast.error("Failed to restore admin rights. Please try again.");
              } else {
                toast.success("Admin privileges restored!");
                
                // Force reload after a delay
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            }
          } catch (error) {
            console.error("Error restoring admin rights:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormError(error.message || "An error occurred during login");
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Reset form error when user types
  useEffect(() => {
    if (formError) {
      const subscription = form.watch(() => {
        setFormError(null);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, formError]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="example@email.com" 
                  autoComplete="email" 
                  {...field} 
                  disabled={isLoading}
                />
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
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    autoComplete="current-password" 
                    {...field} 
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={toggleShowPassword}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
