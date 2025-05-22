
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StorageSettings } from "@/types/camera";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StorageProviderSelector from "./StorageProviderSelector";
import StorageProviderFields from "./StorageProviderFields";
import RetentionPolicyForm from "./RetentionPolicyForm";

// Create a schema for form validation using zod
export const StorageFormSchema = z.object({
  type: z.enum(["local", "nas", "s3", "dropbox", "google_drive", "onedrive", "azure_blob", "backblaze"]),
  path: z.string().optional(),
  retentionDays: z.number().int().min(1).max(365),
  overwriteOldest: z.boolean(),
  nasAddress: z.string().optional(),
  nasPath: z.string().optional(),
  nasUsername: z.string().optional(),
  nasPassword: z.string().optional(),
  s3Endpoint: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3AccessKey: z.string().optional(),
  s3SecretKey: z.string().optional(),
  s3Region: z.string().optional()
});

// Export the type from the schema
export type StorageFormSchemaType = z.infer<typeof StorageFormSchema>;

export interface StorageFormProps {
  initialSettings: StorageSettings;
  onSave: (settings: StorageSettings) => Promise<boolean>;
  isLoading: boolean;
  isSaving: boolean;
}

// Helper function to convert DB model to form model
const dbToFormModel = (settings: StorageSettings): StorageFormSchemaType => {
  return {
    type: settings.type,
    path: settings.path || "",
    retentionDays: settings.retentiondays,
    overwriteOldest: settings.overwriteoldest,
    nasAddress: settings.nasaddress || "",
    nasPath: settings.naspath || "",
    nasUsername: settings.nasusername || "",
    nasPassword: settings.naspassword || "",
    s3Endpoint: settings.s3endpoint || "",
    s3Bucket: settings.s3bucket || "",
    s3AccessKey: settings.s3accesskey || "",
    s3SecretKey: settings.s3secretkey || "",
    s3Region: settings.s3region || ""
  };
};

// Helper function to convert form model back to DB model
const formToDbModel = (form: StorageFormSchemaType, originalId?: string): StorageSettings => {
  return {
    id: originalId,
    type: form.type,
    path: form.path,
    retentiondays: form.retentionDays,
    overwriteoldest: form.overwriteOldest,
    nasaddress: form.nasAddress,
    naspath: form.nasPath,
    nasusername: form.nasUsername,
    naspassword: form.nasPassword,
    s3endpoint: form.s3Endpoint,
    s3bucket: form.s3Bucket,
    s3accesskey: form.s3AccessKey,
    s3secretkey: form.s3SecretKey,
    s3region: form.s3Region
  };
};

const StorageForm = ({
  initialSettings,
  onSave,
  isLoading,
  isSaving
}: StorageFormProps) => {
  const form = useForm<StorageFormSchemaType>({
    resolver: zodResolver(StorageFormSchema),
    defaultValues: dbToFormModel(initialSettings),
  });

  const handleSubmit = async (data: StorageFormSchemaType) => {
    const dbModel = formToDbModel(data, initialSettings.id);
    await onSave(dbModel);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <StorageProviderSelector 
          form={form}
          isLoading={isLoading || isSaving}
        />
        
        <StorageProviderFields
          form={form}
          isLoading={isLoading || isSaving}
          currentStorageType={form.watch("type")}
        />
        
        <RetentionPolicyForm
          form={form}
          isLoading={isLoading || isSaving}
        />
        
        <Button 
          type="submit" 
          disabled={isLoading || isSaving}
          className="w-full md:w-auto"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
};

export default StorageForm;
