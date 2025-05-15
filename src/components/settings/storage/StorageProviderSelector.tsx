
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { HardDrive, Server, Cloud } from "lucide-react";
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
          <FormLabel>Storage Type</FormLabel>
          <Select
            disabled={isLoading}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select storage provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="local">
                <div className="flex items-center">
                  <HardDrive className="mr-2 h-4 w-4" />
                  <span>Local Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="nas">
                <div className="flex items-center">
                  <Server className="mr-2 h-4 w-4" />
                  <span>NAS Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="s3">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>S3 Compatible Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="dropbox">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Dropbox</span>
                </div>
              </SelectItem>
              <SelectItem value="google_drive">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Google Drive</span>
                </div>
              </SelectItem>
              <SelectItem value="onedrive">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>OneDrive</span>
                </div>
              </SelectItem>
              <SelectItem value="azure_blob">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Azure Blob Storage</span>
                </div>
              </SelectItem>
              <SelectItem value="backblaze">
                <div className="flex items-center">
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Backblaze B2</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default StorageProviderSelector;
