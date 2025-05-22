
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";

interface NasStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const NasStorageFields = ({ form, isLoading }: NasStorageFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nasaddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Address</FormLabel>
            <FormControl>
              <Input
                placeholder="192.168.1.100"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="naspath"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Share Path</FormLabel>
            <FormControl>
              <Input
                placeholder="/recordings"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nasusername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Username</FormLabel>
            <FormControl>
              <Input
                placeholder="username"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="naspassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default NasStorageFields;
