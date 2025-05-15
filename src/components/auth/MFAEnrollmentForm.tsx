
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, QrCode, Verified } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface MFAEnrollmentFormProps {
  redirectUrl?: string;
}

const otpFormSchema = z.object({
  otp: z.string().length(6, 'Verification code must be 6 digits')
});

export function MFAEnrollmentForm({ redirectUrl = '/' }: MFAEnrollmentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [step, setStep] = useState<'enrolling' | 'verifying'>('enrolling');
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    if (user) {
      enrollMFA();
    }
  }, [user]);

  const enrollMFA = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setStep('verifying');
    } catch (error: any) {
      console.error('Error enrolling MFA:', error);
      toast.error('Failed to setup MFA', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof otpFormSchema>) => {
    if (!factorId) {
      toast.error('MFA setup not initialized properly');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) throw error;

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code: values.otp,
      });

      if (verifyError) throw verifyError;

      // Update profile to indicate MFA enrollment complete
      await supabase
        .from('profiles')
        .update({ mfa_enrolled: true })
        .eq('id', user!.uid);

      toast.success('MFA setup successful', {
        description: 'Your account is now secured with two-factor authentication',
      });

      // Redirect to the intended destination
      navigate(redirectUrl);
    } catch (error: any) {
      console.error('Error verifying MFA code:', error);
      toast.error('Failed to verify code', {
        description: error.message || 'Please check your code and try again',
      });
      form.setError('otp', { message: 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'enrolling' && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p>Setting up multi-factor authentication...</p>
        </div>
      )}

      {step === 'verifying' && qrCode && (
        <>
          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertTitle>MFA Enrollment Required</AlertTitle>
            <AlertDescription>
              Scan the QR code with your authenticator app and enter the verification code to continue.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center my-6">
            <div className="p-2 bg-white rounded">
              <img src={qrCode} alt="QR Code for MFA setup" className="w-48 h-48" />
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>6-Digit Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Verified className="mr-2 h-4 w-4" />
                    Verify and Complete Setup
                  </>
                )}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
