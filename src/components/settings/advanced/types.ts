
export interface GeneralTabProps {
  settings: {
    serverPort: string;
    logLevel: string;
    logRetentionDays: number;
  };
  loading: boolean;
  onSave: (settings: any) => Promise<boolean>;
}
