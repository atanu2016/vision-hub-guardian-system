
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

interface DatabaseConfigProps {
  databaseType: string;
}

export default function DatabaseConfig({ databaseType }: DatabaseConfigProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span>Database Configuration</span>
        </CardTitle>
        <CardDescription>
          View and modify your current database connection settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {databaseType === 'supabase' ? (
            <>
              <div className="flex justify-between items-center">
                <span className="font-medium">Connection Type:</span>
                <Badge>Supabase</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Your application is currently connected to a Supabase project. 
                To modify your connection or migrate to a MySQL database, use the Migration tab.
              </div>
            </>
          ) : databaseType === 'mysql' ? (
            <>
              <div className="flex justify-between items-center">
                <span className="font-medium">Connection Type:</span>
                <Badge>MySQL</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Host</h4>
                  <p className="text-sm text-muted-foreground">
                    localhost
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Port</h4>
                  <p className="text-sm text-muted-foreground">3306</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Database</h4>
                  <p className="text-sm text-muted-foreground">vision_hub</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Username</h4>
                  <p className="text-sm text-muted-foreground">root</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Unable to determine database configuration. Please check your connection settings.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
