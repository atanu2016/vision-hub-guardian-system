
import { StorageSettings } from "@/types/camera";

// Define the UI-friendly version of StorageSettings
export interface StorageFormData {
  type: "local" | "nas" | "s3" | "dropbox" | "google_drive" | "onedrive" | "azure_blob" | "backblaze";
  path?: string;
  retentionDays: number;
  overwriteOldest: boolean;
  // NAS fields
  nasAddress?: string;
  nasPath?: string;
  nasUsername?: string;
  nasPassword?: string;
  // S3 fields
  s3Endpoint?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  // Cloud storage fields
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

export const useStorageAdapter = () => {
  // Convert DB format to form format
  const toFormData = (settings: StorageSettings): StorageFormData => {
    return {
      type: settings.type,
      path: settings.path,
      retentionDays: settings.retentiondays,
      overwriteOldest: settings.overwriteoldest,
      nasAddress: settings.nasaddress,
      nasPath: settings.naspath,
      nasUsername: settings.nasusername,
      nasPassword: settings.naspassword,
      s3Endpoint: settings.s3endpoint,
      s3Bucket: settings.s3bucket,
      s3AccessKey: settings.s3accesskey,
      s3SecretKey: settings.s3secretkey,
      s3Region: settings.s3region,
      dropboxToken: settings.dropboxtoken,
      dropboxFolder: settings.dropboxfolder,
      googleDriveToken: settings.googledrivertoken,
      googleDriveFolderId: settings.googledrivefolderid,
      oneDriveToken: settings.onedrivetoken,
      oneDriveFolderId: settings.onedrivefolderid,
      azureConnectionString: settings.azureconnectionstring,
      azureContainer: settings.azurecontainer,
      backblazeKeyId: settings.backblazekeyid,
      backblazeApplicationKey: settings.backblazeapplicationkey,
      backblazeBucket: settings.backblazebucket,
    };
  };

  // Convert form format to DB format
  const toDbFormat = (formData: StorageFormData): StorageSettings => {
    return {
      type: formData.type,
      path: formData.path,
      retentiondays: formData.retentionDays,
      overwriteoldest: formData.overwriteOldest,
      nasaddress: formData.nasAddress,
      naspath: formData.nasPath,
      nasusername: formData.nasUsername,
      naspassword: formData.nasPassword,
      s3endpoint: formData.s3Endpoint,
      s3bucket: formData.s3Bucket,
      s3accesskey: formData.s3AccessKey,
      s3secretkey: formData.s3SecretKey,
      s3region: formData.s3Region,
      dropboxtoken: formData.dropboxToken,
      dropboxfolder: formData.dropboxFolder,
      googledrivertoken: formData.googleDriveToken,
      googledrivefolderid: formData.googleDriveFolderId,
      onedrivetoken: formData.oneDriveToken,
      onedrivefolderid: formData.oneDriveFolderId,
      azureconnectionstring: formData.azureConnectionString,
      azurecontainer: formData.azureContainer,
      backblazekeyid: formData.backblazeKeyId,
      backblazeapplicationkey: formData.backblazeApplicationKey,
      backblazebucket: formData.backblazeBucket,
    };
  };

  return {
    toFormData,
    toDbFormat
  };
};
