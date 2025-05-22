
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StorageForm from "@/components/settings/storage/StorageForm";
import { StorageFormSchemaType } from "@/components/settings/storage/StorageForm";
import { UseFormReturn } from "react-hook-form";

interface StorageConfigCardProps {
  form: UseFormReturn<StorageFormSchemaType>;
  onSubmit: (values: StorageFormSchemaType) => Promise<boolean>;
  isLoading: boolean;
}

const StorageConfigCard = ({ form, onSubmit, isLoading }: StorageConfigCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Configuration</CardTitle>
        <CardDescription>
          Configure storage location and retention policies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StorageForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default StorageConfigCard;
