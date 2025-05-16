
import { z } from 'zod';

// MySQL form validation schema
export const mysqlSchema = z.object({
  host: z.string().min(1, { message: "Host is required" }),
  port: z.string().regex(/^\d+$/, { message: "Port must be a number" }),
  database: z.string().min(1, { message: "Database name is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().optional(),
  useSSL: z.boolean().optional().default(false),
});

// Infer the type from the schema
export type MySQLFormValues = z.infer<typeof mysqlSchema>;

// Default values for the form
export const defaultMySQLValues: MySQLFormValues = {
  host: "localhost",
  port: "3306",
  database: "vision_hub",
  username: "root",
  password: "",
  useSSL: false,
};
