
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";
import { HardDrive, Database, Dropbox, Folder, Cloud, Microsoft, Archive } from "lucide-react";

interface StorageProviderSelectorProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

// Storage provider selector with radio buttons and icons
const StorageProviderSelector = ({ form, isLoading }: StorageProviderSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Storage Provider</FormLabel>
          <FormControl>
            <RadioGroup
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading}
              value={field.value}
            >
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="local" id="local" />
                <Label htmlFor="local" className="flex items-center cursor-pointer">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Local Storage
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="nas" id="nas" />
                <Label htmlFor="nas" className="flex items-center cursor-pointer">
                  <Database className="h-4 w-4 mr-2" />
                  NAS Storage
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="s3" id="s3" />
                <Label htmlFor="s3" className="flex items-center cursor-pointer">
                  <Cloud className="h-4 w-4 mr-2" />
                  S3 Compatible
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="dropbox" id="dropbox" />
                <Label htmlFor="dropbox" className="flex items-center cursor-pointer">
                  <Dropbox className="h-4 w-4 mr-2" />
                  Dropbox
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="google_drive" id="google_drive" />
                <Label htmlFor="google_drive" className="flex items-center cursor-pointer">
                  <Folder className="h-4 w-4 mr-2" />
                  Google Drive
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="onedrive" id="onedrive" />
                <Label htmlFor="onedrive" className="flex items-center cursor-pointer">
                  <Microsoft className="h-4 w-4 mr-2" />
                  OneDrive
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="azure_blob" id="azure_blob" />
                <Label htmlFor="azure_blob" className="flex items-center cursor-pointer">
                  <Cloud className="h-4 w-4 mr-2" />
                  Azure Blob Storage
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                <RadioGroupItem value="backblaze" id="backblaze" />
                <Label htmlFor="backblaze" className="flex items-center cursor-pointer">
                  <Archive className="h-4 w-4 mr-2" />
                  Backblaze B2
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default StorageProviderSelector;
