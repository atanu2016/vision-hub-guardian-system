
import { Badge } from '@/components/ui/badge';

interface TableStatusListProps {
  tables: readonly string[];
  tablesStatus: Record<string, boolean>;
  isLoading: boolean;
  tableStats: Record<string, { rows: number; size: string }>;
}

/**
 * Component to display the status of database tables
 */
export default function TableStatusList({
  tables,
  tablesStatus,
  isLoading,
  tableStats
}: TableStatusListProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium">Table Name</th>
            <th scope="col" className="px-4 py-2 text-center text-xs font-medium">Status</th>
            <th scope="col" className="px-4 py-2 text-right text-xs font-medium">Size</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {tables.map(table => (
            <tr key={table}>
              <td className="px-4 py-2 text-sm">{table}</td>
              <td className="px-4 py-2 text-center">
                <Badge variant={
                  isLoading ? "outline" : 
                  tablesStatus[table] ? "secondary" : "destructive"
                }>
                  {isLoading ? "Checking..." : 
                   tablesStatus[table] ? "Exists" : "Missing"}
                </Badge>
              </td>
              <td className="px-4 py-2 text-right text-sm">
                {tablesStatus[table] && tableStats[table] ? 
                  `${tableStats[table]?.rows || 0} rows (${tableStats[table]?.size || '0 KB'})` : 
                  '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
