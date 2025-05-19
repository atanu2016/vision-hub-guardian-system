
interface PermissionAlertProps {
  hasPermission: boolean;
}

export default function PermissionAlert({ hasPermission }: PermissionAlertProps) {
  if (hasPermission) {
    return null;
  }
  
  return (
    <div className="rounded-md bg-yellow-50 p-4 mb-4">
      <div className="text-sm text-yellow-700">
        You don't have permission to assign cameras. Please contact an administrator.
      </div>
    </div>
  );
}
