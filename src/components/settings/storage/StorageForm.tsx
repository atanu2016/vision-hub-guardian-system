
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import StorageProviderSelector from "./StorageProviderSelector";
import StorageProviderFields from "./StorageProviderFields";
import RetentionPolicyForm from "./RetentionPolicyForm";
import { StorageSettings } from "@/types/camera";

// Define the schema for storage form
export const StorageFormSchema = z.object({
  type: z.enum(['local', 'nas', 's3', 'dropbox', 'google_drive', 'onedrive', 'azure_blob', 'backblaze']),
  path: z.string().optional(),
  retentiondays: z.number().min(1),
  overwriteoldest: z.boolean(),
  // NAS specific
  nasaddress: z.string().optional(),
  naspath: z.string().optional(),
  nasusername: z.string().optional(),
  naspassword: z.string().optional(),
  // S3 specific
  s3endpoint: z.string().optional(),
  s3bucket: z.string().optional(),
  s3accesskey: z.string().optional(),
  s3secretkey: z.string().optional(),
  s3region: z.string().optional(),
  // Cloud provider specific
  dropboxtoken: z.string().optional(),
  dropboxfolder: z.string().optional(),
  googledrivertoken: z.string().optional(),
  googledrivefolderid: z.string().optional(),
  onedrivetoken: z.string().optional(),
  onedrivefolderid: z.string().optional(),
  azureconnectionstring: z.string().optional(),
  azurecontainer: z.string().optional(),
  backblazekeyid: z.string().optional(),
  backblazeapplicationkey: z.string().optional(),
  backblazebucket: z.string().optional(),
});

// Export the type for the form values
export type StorageFormSchemaType = z.infer<typeof StorageFormSchema>;

interface StorageFormProps {
  form: UseFormReturn<StorageFormSchemaType>;
  onSubmit: (values: StorageFormSchemaType) => void;
  isLoading: boolean;
}

const StorageForm = ({ form, onSubmit, isLoading }: StorageFormProps) => {
  const storageType = form.watch("type");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <StorageProviderSelector form={form} isLoading={isLoading} />
        <StorageProviderFields form={form} isLoading={isLoading} currentStorageType={storageType} />
        <RetentionPolicyForm form={form} isLoading={isLoading} />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Storage Settings"}
        </Button>
      </form>
    </Form>
  );
};

export default StorageForm;
