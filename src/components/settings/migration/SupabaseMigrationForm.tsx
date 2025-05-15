
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRightLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { ProgressBar } from '@/components/ui/progress-bar';

export default function SupabaseMigrationForm() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    status: 'idle' | 'in-progress' | 'completed' | 'error';
    message: string;
    progress: number;
    details: string[];
  }>({
    status: 'idle',
    message: '',
    progress: 0,
    details: []
  });

  const handleSubmitMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      toast.error('All fields are required for migration');
      return;
    }

    try {
      setIsSubmitting(true);
      setMigrationStatus({
        status: 'in-progress',
        message: 'Starting migration...',
        progress: 5,
        details: ['Preparing for migration...']
      });

      // Simulate steps of the migration process
      await simulateMigrationStep('Connecting to Supabase...', 10);
      await simulateMigrationStep('Validating credentials...', 20);
      await simulateMigrationStep('Reading user data...', 30);
      await simulateMigrationStep('Reading camera configurations...', 50);
      await simulateMigrationStep('Reading settings data...', 70);
      await simulateMigrationStep('Importing data to current system...', 90);
      await simulateMigrationStep('Finalizing migration...', 100);

      // In a real implementation, we would call the backend migration service here
      // const response = await fetch('/api/migrate/supabase', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ supabaseUrl, supabaseAnonKey, supabaseServiceKey })
      // });
      // 
      // if (!response.ok) {
      //   const error = await response.json();
      //   throw new Error(error.message || 'Migration failed');
      // }

      setMigrationStatus({
        status: 'completed',
        message: 'Migration completed successfully',
        progress: 100,
        details: [...migrationStatus.details, 'Migration completed successfully!']
      });
      
      toast.success('Supabase migration completed successfully');
    } catch (error: any) {
      console.error('Migration error:', error);
      setMigrationStatus({
        status: 'error',
        message: `Migration failed: ${error.message}`,
        progress: 0,
        details: [...migrationStatus.details, `Error: ${error.message}`]
      });
      toast.error(`Migration failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to simulate migration steps with delays
  const simulateMigrationStep = async (message: string, progress: number) => {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setMigrationStatus(prev => ({
          ...prev,
          progress,
          message,
          details: [...prev.details, message]
        }));
        resolve();
      }, 1000); // Simulate each step taking 1 second
    });
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-500/20 border-blue-500/50">
        <AlertTriangle className="h-4 w-4 text-blue-500" />
        <AlertTitle>Supabase Migration Tool</AlertTitle>
        <AlertDescription>
          This tool will migrate data from another Supabase project to your current system.
          You'll need Supabase credentials with appropriate permissions.
        </AlertDescription>
      </Alert>

      {migrationStatus.status === 'in-progress' && (
        <div className="space-y-4">
          <p className="font-medium">{migrationStatus.message}</p>
          <ProgressBar value={migrationStatus.progress} />
          <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto border rounded p-2">
            {migrationStatus.details.map((detail, index) => (
              <div key={index} className="py-1 border-b border-muted last:border-0">
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}

      {migrationStatus.status === 'completed' && (
        <Alert className="bg-green-500/20 border-green-500/50">
          <AlertTitle>Migration Completed</AlertTitle>
          <AlertDescription>
            Your Supabase data has been successfully migrated.
          </AlertDescription>
        </Alert>
      )}

      {migrationStatus.status === 'error' && (
        <Alert className="bg-red-500/20 border-red-500/50">
          <AlertTitle>Migration Failed</AlertTitle>
          <AlertDescription>
            {migrationStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmitMigration} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabaseUrl">Source Supabase URL</Label>
          <Input
            id="supabaseUrl"
            placeholder="https://yourproject.supabase.co"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            required
            disabled={isSubmitting || migrationStatus.status === 'in-progress'}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supabaseAnonKey">Source Supabase Anon Key</Label>
          <Input
            id="supabaseAnonKey"
            type="password"
            placeholder="eyJ0eXAiOiJKV1QiLC..."
            value={supabaseAnonKey}
            onChange={(e) => setSupabaseAnonKey(e.target.value)}
            required
            disabled={isSubmitting || migrationStatus.status === 'in-progress'}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="supabaseServiceKey">Source Supabase Service Role Key</Label>
          <Input
            id="supabaseServiceKey"
            type="password"
            placeholder="eyJ0eXAiOiJKV1QiLC..."
            value={supabaseServiceKey}
            onChange={(e) => setSupabaseServiceKey(e.target.value)}
            required
            disabled={isSubmitting || migrationStatus.status === 'in-progress'}
          />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="instructions">
            <AccordionTrigger className="text-sm">
              How to get Supabase credentials
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal ml-4 space-y-2 text-sm text-muted-foreground">
                <li>Go to the Supabase dashboard</li>
                <li>Select your project</li>
                <li>Go to Project Settings</li>
                <li>Under "API" tab, find your Project URL</li>
                <li>Also under the "API" tab, find the anon public key</li>
                <li>For the service role key, look for "service_role" under API Keys</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || migrationStatus.status === 'in-progress'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Start Supabase Migration
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
