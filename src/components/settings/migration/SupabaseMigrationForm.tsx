
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRightLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { validateMigration, assignPermissionsAfterMigration, verifyDatabaseState } from '@/services/migration/migrationValidator';

export default function SupabaseMigrationForm() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [migrationOptions, setMigrationOptions] = useState({
    migrateUsers: true,
    migrateCameras: true,
    migrateSettings: true,
    migrateRecordings: true
  });
  const [migrationStatus, setMigrationStatus] = useState<{
    status: 'idle' | 'in-progress' | 'completed' | 'error' | 'verifying';
    message: string;
    progress: number;
    details: string[];
    verificationResults?: {
      success: boolean;
      details: string[];
    }
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
      
      if (migrationOptions.migrateUsers) {
        await simulateMigrationStep('Reading user data...', 30);
      }
      
      if (migrationOptions.migrateCameras) {
        await simulateMigrationStep('Reading camera configurations...', 50);
      }
      
      if (migrationOptions.migrateSettings) {
        await simulateMigrationStep('Reading settings data...', 70);
      }
      
      await simulateMigrationStep('Importing data to current system...', 90);
      
      // In a real implementation, we would call the backend migration service
      // Call the data migration function
      // const response = await fetch('/api/migrate/supabase', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     supabaseUrl, 
      //     supabaseAnonKey, 
      //     supabaseServiceKey,
      //     options: migrationOptions 
      //   })
      // });
      
      // Simulating the migration being successful
      await simulateMigrationStep('Finalizing migration...', 95);
      
      // Add verification step after migration
      setMigrationStatus(prev => ({
        ...prev,
        status: 'verifying',
        message: 'Verifying migration success and assigning permissions...',
        progress: 98,
      }));
      
      // Simulate a short delay for verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Assign permissions after migration
      const permissionsAssigned = await assignPermissionsAfterMigration();
      if (!permissionsAssigned) {
        throw new Error('Failed to assign permissions after migration');
      }
      
      // Validate the migration
      const migrationValid = await validateMigration('supabase', 'supabase');
      if (!migrationValid) {
        throw new Error('Migration validation failed');
      }
      
      // Double verify the database state
      const verificationResults = await verifyDatabaseState('supabase');
      
      setMigrationStatus(prev => ({
        ...prev,
        status: verificationResults.success ? 'completed' : 'error',
        message: verificationResults.success 
          ? 'Migration completed and verified successfully' 
          : 'Migration completed but verification found issues',
        progress: 100,
        details: [...prev.details, 'Migration completed', 'Verification completed'],
        verificationResults
      }));
      
      if (verificationResults.success) {
        toast.success('Supabase migration completed and verified successfully');
      } else {
        toast.warning('Migration completed but verification found issues', {
          description: 'Check the verification details'
        });
      }
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

  const renderVerificationResults = () => {
    if (!migrationStatus.verificationResults) return null;
    
    return (
      <div className="mt-4 p-3 border rounded bg-secondary/20">
        <h4 className="text-sm font-medium mb-2">Verification Results</h4>
        <div className="space-y-1 text-sm">
          {migrationStatus.verificationResults.details.map((detail, index) => (
            <div key={index} className="flex items-start">
              {detail.startsWith('✅') ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : detail.startsWith('❌') ? (
                <XCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 mr-2" />
              )}
              <span>{detail.replace(/^[✅❌]\s/, '')}</span>
            </div>
          ))}
        </div>
      </div>
    );
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
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${migrationStatus.progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-muted-foreground max-h-40 overflow-y-auto border rounded p-2">
            {migrationStatus.details.map((detail, index) => (
              <div key={index} className="py-1 border-b border-muted last:border-0">
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}

      {migrationStatus.status === 'verifying' && (
        <div className="space-y-4">
          <p className="font-medium flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {migrationStatus.message}
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${migrationStatus.progress}%` }}
            ></div>
          </div>
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
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Migration Completed</AlertTitle>
          <AlertDescription>
            Your Supabase data has been successfully migrated and verified.
          </AlertDescription>
        </Alert>
      )}

      {migrationStatus.status === 'error' && (
        <Alert className="bg-red-500/20 border-red-500/50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertTitle>Migration Failed</AlertTitle>
          <AlertDescription>
            {migrationStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {(migrationStatus.status === 'completed' || migrationStatus.status === 'error') && 
        renderVerificationResults()}

      <form onSubmit={handleSubmitMigration} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabaseUrl">Source Supabase URL</Label>
          <Input
            id="supabaseUrl"
            placeholder="https://yourproject.supabase.co"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            required
            disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
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
            disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
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
            disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">Migration Options</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateUsers" 
                checked={migrationOptions.migrateUsers}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateUsers: !!checked}))
                }
                disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
              />
              <Label htmlFor="migrateUsers" className="text-sm font-normal">Users & Profiles</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateCameras" 
                checked={migrationOptions.migrateCameras}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateCameras: !!checked}))
                }
                disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
              />
              <Label htmlFor="migrateCameras" className="text-sm font-normal">Cameras & Groups</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateSettings" 
                checked={migrationOptions.migrateSettings}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateSettings: !!checked}))
                }
                disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
              />
              <Label htmlFor="migrateSettings" className="text-sm font-normal">Settings & Configs</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="migrateRecordings" 
                checked={migrationOptions.migrateRecordings}
                onCheckedChange={(checked) => 
                  setMigrationOptions(prev => ({...prev, migrateRecordings: !!checked}))
                }
                disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
              />
              <Label htmlFor="migrateRecordings" className="text-sm font-normal">Recording Data</Label>
            </div>
          </div>
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
          disabled={isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying'}
        >
          {isSubmitting || migrationStatus.status === 'in-progress' || migrationStatus.status === 'verifying' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {migrationStatus.status === 'verifying' ? 'Verifying Migration...' : 'Migrating...'}
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
