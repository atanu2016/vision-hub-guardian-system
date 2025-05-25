
import ApplicationLogsViewer from '@/components/logs/ApplicationLogsViewer';
import LogTestButton from '@/components/logs/LogTestButton';

const ApplicationLogs = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Logs</h1>
          <p className="text-muted-foreground">
            Comprehensive application logs for troubleshooting streaming and system issues
          </p>
        </div>
        <LogTestButton />
      </div>
      
      <ApplicationLogsViewer />
    </div>
  );
};

export default ApplicationLogs;
