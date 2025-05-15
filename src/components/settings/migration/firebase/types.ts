
import { z } from 'zod';

// Form schema
export const firebaseMigrationFormSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  authDomain: z.string().min(1, 'Auth Domain is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  storageBucket: z.string().optional(),
  databaseURL: z.string().optional(),
  serviceAccountJson: z.string().min(1, 'Service account JSON is required'),
  migrateCameras: z.boolean().default(true),
  migrateUsers: z.boolean().default(false),
  migrateSettings: z.boolean().default(true),
  migrateRecordings: z.boolean().default(false)
});

export type FirebaseMigrationFormValues = z.infer<typeof firebaseMigrationFormSchema>;
