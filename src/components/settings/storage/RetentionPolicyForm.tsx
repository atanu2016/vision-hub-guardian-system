
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";

interface RetentionPolicyFormProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

// Component for retention policy settings
const RetentionPolicyForm = ({ form, isLoading }: RetentionPolicyFormProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="retentiondays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Retention Period (Days)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                max="365"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                value={field.value}
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>
              Number of days to keep recordings before automatic deletion
            </FormDescription>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="overwriteoldest"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Overwrite Oldest Recordings</FormLabel>
              <FormDescription>
                When storage is full, automatically delete the oldest recordings to make space
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default RetentionPolicyForm;
