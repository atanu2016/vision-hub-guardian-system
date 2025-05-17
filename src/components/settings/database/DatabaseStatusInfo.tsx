
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface DatabaseStatusInfoProps {
  connected: boolean;
  type: string;
  tablesStatus: Record<string, boolean>;
  tables: readonly string[];
  dbStats: {
    totalRows: number;
    totalSize: string;
  };
  dbStatsLoading: boolean;
}

/**
 * Component to display database connection and usage information
 */
export default function DatabaseStatusInfo({
  connected,
  type,
  tablesStatus,
  tables,
  dbStats,
  dbStatsLoading
}: DatabaseStatusInfoProps) {
  
  const getTableStatusCount = () => {
    if (!tablesStatus) return { existing: 0, missing: 0 };
    
    const existing = Object.values(tablesStatus).filter(Boolean).length;
    const total = tables.length;
    return { existing, missing: total - existing };
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Connection Status:</span>
        <Badge variant={connected ? "secondary" : "destructive"}>
          {connected ? "Connected" : "Not Connected"}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Database Type:</span>
        <Badge variant="outline">
          {type === 'supabase' ? 'Supabase' : 
           type === 'mysql' ? 'MySQL' : 'Unknown'}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Tables Status:</span>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-500/20">
            {getTableStatusCount().existing} Existing
          </Badge>
          <Badge variant="outline" className="bg-red-500/20">
            {getTableStatusCount().missing} Missing
          </Badge>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Database Usage:</span>
        {dbStatsLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading stats...</span>
          </div>
        ) : (
          <Badge variant="outline" className="bg-blue-500/20">
            {dbStats.totalRows} Rows / {dbStats.totalSize}
          </Badge>
        )}
      </div>
    </div>
  );
}
