
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StorageFormSchemaType } from "./StorageForm";

interface StorageProviderSelectorProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const StorageProviderSelector = ({ form, isLoading }: StorageProviderSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Storage Provider</FormLabel>
          <Select
            disabled={isLoading}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="local">Local Storage</SelectItem>
              <SelectItem value="nas">Network Attached Storage (NAS)</SelectItem>
              <SelectItem value="s3">S3 Compatible Storage</SelectItem>
              <SelectItem value="dropbox">Dropbox</SelectItem>
              <SelectItem value="google_drive">Google Drive</SelectItem>
              <SelectItem value="onedrive">OneDrive</SelectItem>
              <SelectItem value="azure_blob">Azure Blob Storage</SelectItem>
              <SelectItem value="backblaze">Backblaze B2</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default StorageProviderSelector;
