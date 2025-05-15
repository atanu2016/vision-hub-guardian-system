
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple query to verify connection
        const { data, error } = await supabase
          .from('system_stats')
          .select('id')
          .limit(1);
          
        if (error) {
          console.error('Supabase connection error:', error);
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          console.log('Supabase connection successful');
          setStatus('connected');
        }
      } catch (err) {
        console.error('Unexpected error testing Supabase connection:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    checkConnection();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center space-x-2 text-xs text-blue-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking Supabase connection...</span>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="text-xs text-red-400">
        <p>Supabase connection error: {errorMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="text-xs text-green-400">
      <p>Successfully connected to Supabase</p>
    </div>
  );
};
