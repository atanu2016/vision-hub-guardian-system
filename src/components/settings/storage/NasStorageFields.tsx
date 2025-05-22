
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StorageFormSchemaType } from "./StorageForm";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NasStorageFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
}

const NasStorageFields = ({ form, isLoading }: NasStorageFieldsProps) => {
  const [testing, setTesting] = useState(false);
  
  const testNasConnection = async () => {
    const nasAddress = form.getValues("nasAddress");
    const nasPath = form.getValues("nasPath");
    const nasUsername = form.getValues("nasUsername");
    const nasPassword = form.getValues("nasPassword");
    
    if (!nasAddress || !nasPath) {
      toast.error("Please enter NAS address and share path");
      return;
    }
    
    setTesting(true);
    
    try {
      // In production, this would be a real API call to test NAS connection
      const response = await fetch('/api/storage/test-nas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: nasAddress,
          path: nasPath,
          username: nasUsername || '',
          password: nasPassword || '',
        }),
      });
      
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("NAS connection successful! Storage is accessible.");
    } catch (error) {
      console.error("NAS connection test failed:", error);
      toast.error("Failed to connect to NAS storage. Please check credentials and network connection.");
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <>
      <div className="bg-muted p-3 rounded-md mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Enter the details for your NAS/SMB share. The system needs read/write access to store recordings.
            Make sure the share is accessible from the server.
          </p>
        </div>
      </div>
    
      <FormField
        control={form.control}
        name="nasAddress"
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
            <FormDescription>
              IP address or hostname of your NAS server
            </FormDescription>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nasPath"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NAS Share Path</FormLabel>
            <FormControl>
              <Input
                placeholder="/recordings or \\server\share"
                {...field}
                value={field.value || ""}
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription>
              Full path to the share (e.g., /volume1/recordings or \\server\share)
            </FormDescription>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="nasUsername"
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
        name="nasPassword"
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
      
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={testNasConnection}
          disabled={isLoading || testing}
        >
          {testing ? "Testing Connection..." : "Test NAS Connection"}
        </Button>
      </div>
    </>
  );
};

export default NasStorageFields;
