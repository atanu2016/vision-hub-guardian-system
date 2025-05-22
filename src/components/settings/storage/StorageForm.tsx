import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { StorageSettings } from "@/types/camera";
import StorageProviderSelector from "./StorageProviderSelector";
import StorageProviderFields from "./StorageProviderFields";
import RetentionPolicyForm from "./RetentionPolicyForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StorageFormData, useStorageAdapter } from "@/hooks/storage/useStorageAdapter";

// Define form schema for storage settings using the UI-friendly types
const storageFormSchema = z.object({
  type: z.enum(["local", "nas", "s3", "dropbox", "google_drive", "onedrive", "azure_blob", "backblaze"]),
  path: z.string().optional(),
  retentionDays: z.coerce.number().min(1, "Retention period must be at least 1 day").max(365, "Retention period cannot exceed 365 days"),
  overwriteOldest: z.boolean(),
  // NAS fields
  nasAddress: z.string().optional(),
  nasPath: z.string().optional(),
  nasUsername: z.string().optional(),
  nasPassword: z.string().optional(),
  // S3 fields
  s3Endpoint: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3Region: z.string().optional(),
  // Cloud storage fields (optional)
  dropboxToken: z.string().optional(),
  dropboxFolder: z.string().optional(),
  googleDriveToken: z.string().optional(),
  googleDriveFolderId: z.string().optional(),
  oneDriveToken: z.string().optional(),
  oneDriveFolderId: z.string().optional(),
  azureConnectionString: z.string().optional(),
  azureContainer: z.string().optional(),
  backblazeKeyId: z.string().optional(),
  backblazeApplicationKey: z.string().optional(),
  backblazeBucket: z.string().optional(),
});

// Extract type from schema
export type StorageFormSchemaType = z.infer<typeof storageFormSchema>;

interface StorageFormProps {
  initialSettings: StorageSettings;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (settings: StorageSettings) => Promise<boolean>;
}

const StorageForm = ({ initialSettings, isLoading, isSaving, onSave }: StorageFormProps) => {
  const [validationStatus, setValidationStatus] = useState<{ status: 'idle' | 'validating' | 'success' | 'error', message: string }>({
    status: 'idle',
    message: ''
  });
  
  const { toFormData, toDbFormat } = useStorageAdapter();

  // Convert DB format to form format for initial values
  const initialFormData = toFormData(initialSettings);

  // Initialize form with proper defaultValues
  const form = useForm<StorageFormSchemaType>({
    resolver: zodResolver(storageFormSchema),
    defaultValues: initialFormData
  });

  // Update form values when initialSettings changes
  useEffect(() => {
    form.reset(toFormData(initialSettings));
    
    // Reset validation status when form values change
    setValidationStatus({ status: 'idle', message: '' });
  }, [initialSettings, form]);

  // Get current form values
  const currentStorageType = form.watch("type");

  // Handle form submission
  const onSubmit = async (values: StorageFormSchemaType) => {
    // Reset validation status
    setValidationStatus({ status: 'validating', message: 'Validating storage configuration...' });
    
    // Convert form data to StorageSettings type
    const settings = toDbFormat(values);

    const success = await onSave(settings);
    
    if (success) {
      setValidationStatus({ 
        status: 'success', 
        message: 'Storage configuration validated and saved successfully.'
      });
    } else {
      setValidationStatus({ 
        status: 'error', 
        message: 'Failed to validate storage configuration. Please check your settings and try again.'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {validationStatus.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationStatus.message}</AlertDescription>
          </Alert>
        )}
        
        {validationStatus.status === 'success' && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{validationStatus.message}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Storage Provider</CardTitle>
            <CardDescription>
              Select where recordings should be stored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StorageProviderSelector form={form} isLoading={isLoading} />
            <StorageProviderFields 
              form={form} 
              isLoading={isLoading} 
              currentStorageType={currentStorageType} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention Policy</CardTitle>
            <CardDescription>
              Configure how long recordings are kept
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RetentionPolicyForm form={form} isLoading={isLoading} />
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || isSaving || validationStatus.status === 'validating'}
        >
          {isSaving || validationStatus.status === 'validating' ? (
            <div className="flex items-center">
              <span className="animate-spin mr-2">
                <span className="sr-only">Loading...</span>
                ◌
              </span>
              {validationStatus.status === 'validating' ? "Validating..." : "Saving..."}
            </div>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" /> Save Storage Settings
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default StorageForm;
