
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";

interface S3StorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const S3StorageFields = ({ form, isLoading }: S3StorageFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="s3endpoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>S3 Endpoint</FormLabel>
            <FormControl>
              <Input
                placeholder="https://s3.amazonaws.com"
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
        name="s3region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>S3 Region</FormLabel>
            <FormControl>
              <Input
                placeholder="us-east-1"
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
        name="s3bucket"
        render={({ field }) => (
          <FormItem>
            <FormLabel>S3 Bucket</FormLabel>
            <FormControl>
              <Input
                placeholder="my-recordings-bucket"
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
        name="s3accesskey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Access Key</FormLabel>
            <FormControl>
              <Input
                placeholder="AKIAIOSFODNN7EXAMPLE"
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
        name="s3secretkey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secret Key</FormLabel>
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

export default S3StorageFields;
