
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";
import { Button } from "@/components/ui/button";

interface CloudStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
  providerType: "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
}

const CloudStorageFields = ({ form, isLoading, providerType }: CloudStorageFieldsProps) => {
  // This is a simplified implementation - in a real application,
  // different fields would be shown based on the provider type
  
  const getProviderName = () => {
    switch (providerType) {
      case "dropbox": return "Dropbox";
      case "google_drive": return "Google Drive";
      case "onedrive": return "OneDrive";
      case "azure_blob": return "Azure Blob Storage";
      case "backblaze": return "Backblaze B2";
    }
  };

  return (
    <div className="p-4 border rounded-md bg-muted/30">
      <h3 className="mb-4 font-medium">{getProviderName()} Configuration</h3>
      <p className="mb-4 text-muted-foreground">
        To configure {getProviderName()}, you'll need to authorize access to your account.
      </p>
      <Button 
        type="button"
        variant="secondary"
        disabled={isLoading}
      >
        Connect {getProviderName()} Account
      </Button>
      <p className="mt-4 text-sm text-muted-foreground">
        After connecting, you'll be able to select which folder to use for storing recordings.
      </p>
    </div>
  );
};

export default CloudStorageFields;
