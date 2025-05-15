
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Download, Loader2 } from 'lucide-react';
import { exportRecordings, exportAlertHistory, exportConfiguration } from '@/services/exportService';

const ExportControls = () => {
  const [isExporting, setIsExporting] = useState<{
    recordings: boolean;
    alerts: boolean;
    config: boolean;
  }>({
    recordings: false,
    alerts: false,
    config: false,
  });

  const handleExportRecordings = async () => {
    setIsExporting(prev => ({ ...prev, recordings: true }));
    try {
      await exportRecordings();
      toast.success('Recordings data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export recordings data');
    } finally {
      setIsExporting(prev => ({ ...prev, recordings: false }));
    }
  };

  const handleExportAlertHistory = async () => {
    setIsExporting(prev => ({ ...prev, alerts: true }));
    try {
      await exportAlertHistory();
      toast.success('Alert history exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export alert history');
    } finally {
      setIsExporting(prev => ({ ...prev, alerts: false }));
    }
  };

  const handleExportConfig = async () => {
    setIsExporting(prev => ({ ...prev, config: true }));
    try {
      await exportConfiguration();
      toast.success('System configuration exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export system configuration');
    } finally {
      setIsExporting(prev => ({ ...prev, config: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">Export Data</CardTitle>
        <CardDescription>
          Export system data for backup or analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportRecordings}
            disabled={isExporting.recordings}
          >
            {isExporting.recordings ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Recordings
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportAlertHistory}
            disabled={isExporting.alerts}
          >
            {isExporting.alerts ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Alert History
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportConfig}
            disabled={isExporting.config}
          >
            {isExporting.config ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Configuration
              </>
            )}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Exports are generated as CSV or JSON files for easy import into spreadsheet applications or backup systems.</p>
          <p className="mt-2">No sensitive information like passwords or API keys is included in exports.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportControls;
