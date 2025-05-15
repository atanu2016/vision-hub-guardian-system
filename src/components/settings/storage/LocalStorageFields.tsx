
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";

interface LocalStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const LocalStorageFields = ({ form, isLoading }: LocalStorageFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="path"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Local Storage Path</FormLabel>
          <FormControl>
            <Input
              placeholder="/path/to/recordings"
              {...field}
              value={field.value || ""}
              disabled={isLoading}
            />
          </FormControl>
          <FormDescription>
            Path where recordings will be stored on the local filesystem
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default LocalStorageFields;
