
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { fetchCamerasFromDB } from "@/services/database/camera/fetchCameras";
import { Camera } from "@/types/camera";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { getAccessibleCameras } from "@/services/userManagement/cameraAssignmentService";
import LiveViewHeader from "@/components/cameras/live/LiveViewHeader";
import LiveViewSkeleton from "@/components/cameras/live/LiveViewSkeleton";
import EmptyLiveView from "@/components/cameras/live/EmptyLiveView";
import LiveViewGrid from "@/components/cameras/live/LiveViewGrid";

const LiveView = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<"grid-2" | "grid-4" | "grid-9">("grid-4");
  const { user, role } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCameras();
    }
  }, [user, role]);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      console.log("Fetching cameras for live view. User role:", role);
      
      // If user is not authenticated yet, return
      if (!user) {
        console.log("No user authenticated, not fetching cameras");
        setCameras([]);
        return;
      }

      // Use the role-based access control for cameras
      let camerasData: Camera[] = [];
      
      // For admin and superadmin, show all cameras
      if (role === 'admin' || role === 'superadmin') {
        console.log("User is admin/superadmin, fetching all cameras");
        const dbCameras = await fetchCamerasFromDB();
        camerasData = dbCameras;
      } else {
        // For users and operators, show only assigned cameras
        console.log("User is normal user/operator, fetching assigned cameras");
        camerasData = await getAccessibleCameras(user.id, role);
      }
      
      console.log(`Fetched ${camerasData.length} cameras for live view`);
      setCameras(camerasData);
    } catch (error) {
      console.error('Error fetching cameras for live view:', error);
      toast.error("Failed to fetch cameras");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout fullWidth>
      <div className="space-y-4">
        <LiveViewHeader 
          layout={layout} 
          setLayout={setLayout} 
          onRefresh={fetchCameras} 
        />

        {loading ? (
          <LiveViewSkeleton />
        ) : cameras.length === 0 ? (
          <EmptyLiveView role={role} />
        ) : (
          <LiveViewGrid cameras={cameras} layout={layout} />
        )}
      </div>
    </AppLayout>
  );
};

export default LiveView;
