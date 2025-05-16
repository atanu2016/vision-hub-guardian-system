
import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database, Loader2 } from 'lucide-react';

interface AdminAccessRequiredProps {
  loading: boolean;
  hasAccess: boolean;
  children: ReactNode;
  title: string;
  description: string;
}

export default function AdminAccessRequired({ 
  loading, 
  hasAccess, 
  children, 
  title,
  description
}: AdminAccessRequiredProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            Checking access...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            Admin access required to perform data migration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-amber-500">
            You need administrator privileges to access the migration tools.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
