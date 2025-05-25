
import ApplicationLogsViewer from '@/components/logs/ApplicationLogsViewer';

const ApplicationLogs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Logs</h1>
        <p className="text-muted-foreground">
          Comprehensive application logs for troubleshooting streaming and system issues
        </p>
      </div>
      
      <ApplicationLogsViewer />
    </div>
  );
};

export default ApplicationLogs;
