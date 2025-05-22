
import { 
  HardDrive, Database, Cloud, Box, ExternalLink, 
  Archive, Folder, QuestionMark
} from "lucide-react";
import { StorageProviderType } from "@/types/camera";

interface StorageTypeIconProps {
  type: StorageProviderType;
  size?: number;
  className?: string;
}

const StorageTypeIcon = ({ type, size = 16, className = "" }: StorageTypeIconProps) => {
  switch (type) {
    case "local":
      return <HardDrive className={className} size={size} />;
    case "nas":
      return <Database className={className} size={size} />;
    case "s3":
      return <Cloud className={className} size={size} />;
    case "dropbox":
      return <Box className={className} size={size} />;
    case "google_drive":
      return <Folder className={className} size={size} />;
    case "onedrive":
      return <ExternalLink className={className} size={size} />;
    case "azure_blob":
      return <Cloud className={className} size={size} />;
    case "backblaze":
      return <Archive className={className} size={size} />;
    default:
      return <QuestionMark className={className} size={size} />;
  }
};

export default StorageTypeIcon;
