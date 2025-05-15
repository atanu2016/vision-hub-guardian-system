
import { UseFormReturn } from "react-hook-form";
import LocalStorageFields from "./LocalStorageFields";
import NasStorageFields from "./NasStorageFields";
import S3StorageFields from "./S3StorageFields";
import CloudStorageFields from "./CloudStorageFields";

// Storage form schema type interface
interface StorageFormSchemaType {
  type: "local" | "nas" | "s3" | "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
  path?: string;
  retentionDays: number;
  overwriteOldest: boolean;
  nasAddress?: string;
  nasPath?: string;
  nasUsername?: string;
  nasPassword?: string;
  s3Endpoint?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  dropboxToken?: string;
  dropboxFolder?: string;
  googleDriveToken?: string;
  googleDriveFolderId?: string;
  oneDriveToken?: string;
  oneDriveFolderId?: string;
  azureConnectionString?: string;
  azureContainer?: string;
  backblazeKeyId?: string;
  backblazeApplicationKey?: string;
  backblazeBucket?: string;
}

interface StorageProviderFieldsProps {
  form: UseFormReturn<StorageFormSchemaType>;
  isLoading: boolean;
  currentStorageType: "local" | "nas" | "s3" | "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
}

// Component that displays the appropriate fields based on the selected storage type
const StorageProviderFields = ({ form, isLoading, currentStorageType }: StorageProviderFieldsProps) => {
  switch (currentStorageType) {
    case "local":
      return <LocalStorageFields form={form} isLoading={isLoading} />;
    case "nas":
      return <NasStorageFields form={form} isLoading={isLoading} />;
    case "s3":
      return <S3StorageFields form={form} isLoading={isLoading} />;
    case "dropbox":
    case "google_drive":
    case "onedrive":
    case "azure_blob":
    case "backblaze":
      return (
        <CloudStorageFields 
          form={form} 
          isLoading={isLoading} 
          providerType={currentStorageType} 
        />
      );
    default:
      return null;
  }
};

export default StorageProviderFields;
