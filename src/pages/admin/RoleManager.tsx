
import { RoleFixerTool } from "@/components/admin/RoleFixerTool";
import AppLayout from "@/components/layout/AppLayout";

const RoleManager = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Manager</h1>
          <p className="text-muted-foreground">
            Diagnose and fix user role issues in the system
          </p>
        </div>
        
        <RoleFixerTool />
      </div>
    </AppLayout>
  );
};

export default RoleManager;
