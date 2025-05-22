
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Terminal } from 'lucide-react';
import RealTimeLogsViewer from '@/components/settings/RealTimeLogsViewer';

interface DebugTabProps {
  onOpenDebugLog: () => void;
}

export function DebugTab({ onOpenDebugLog }: DebugTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Terminal className="mr-2 h-5 w-5" />
              System Logs
            </CardTitle>
            <CardDescription>Real-time system logs and diagnostic information</CardDescription>
          </div>
          <Button onClick={onOpenDebugLog}>
            Open in Full Screen
          </Button>
        </CardHeader>
        <CardContent>
          <RealTimeLogsViewer isOpen={true} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bug className="mr-2 h-5 w-5" />
            Debug Options
          </CardTitle>
          <CardDescription>Advanced system diagnostics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Log Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Log Level</span>
                    <Select defaultValue="info">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Log Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Log Retention</span>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Retention" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Advanced Debug</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Debug Mode</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Diagnostic Report</span>
                    <Button variant="outline" size="sm">Generate</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
