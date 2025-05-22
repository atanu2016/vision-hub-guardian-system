
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StorageUsageDisplay from "@/components/settings/storage/StorageUsageDisplay";
import { StorageUsageProps } from "@/components/settings/storage/StorageUsageDisplay";

interface StorageUsageCardProps {
  storageUsage: StorageUsageProps;
  retentionDays: number;
  isClearing: boolean;
  onClearStorage: () => Promise<void>;
}

const StorageUsageCard = ({
  storageUsage,
  retentionDays,
  isClearing,
  onClearStorage
}: StorageUsageCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
        <CardDescription>
          Current storage usage for all recordings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StorageUsageDisplay 
          storageUsage={storageUsage}
          retentionDays={retentionDays}
          isClearing={isClearing}
          onClearStorage={onClearStorage}
        />
      </CardContent>
    </Card>
  );
};

export default StorageUsageCard;
