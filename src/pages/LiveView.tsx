
import { useState, useEffect, useCallback } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid-2" | "grid-4" | "grid-9">("grid-4");
  const { user, role } = useAuth();

  const fetchCameras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching cameras for live view. User role:", role);
      
      // If user is not authenticated yet, return
      if (!user) {
        console.log("No user authenticated, not fetching cameras");
        setCameras([]);
        setLoading(false);
        return;
      }

      // Determine user access level
      let isAdmin = false;
      
      // Special case for admin email
      const userEmail = user.email?.toLowerCase();
      if (userEmail === 'admin@home.local' || userEmail === 'superadmin@home.local') {
        isAdmin = true;
      } else {
        isAdmin = role === 'admin' || role === 'superadmin';
      }
      
      // Fetch cameras based on access level
      let camerasData: Camera[] = [];
      
      if (isAdmin) {
        console.log("User is admin/superadmin, fetching all cameras");
        try {
          const allCameras = await fetchCamerasFromDB();
          camerasData = allCameras;
        } catch (adminErr) {
          console.error("Error fetching all cameras:", adminErr);
          setError("Failed to fetch cameras. Please try again.");
          setCameras([]);
          return;
        }
      } else {
        // For users and operators, directly fetch only assigned cameras
        console.log("User is normal user/operator, fetching assigned cameras");
        try {
          camerasData = await getAccessibleCameras(user.id, 'user'); // Force user role for fetching
        } catch (err) {
          console.error("Error fetching assigned cameras:", err);
          setError("Failed to fetch cameras. Please try again.");
          setCameras([]);
          return;
        }
      }
      
      console.log(`Fetched ${camerasData.length} cameras for live view`);
      setCameras(camerasData);
    } catch (error: any) {
      console.error('Error fetching cameras for live view:', error);
      setError(error.message || "Failed to fetch cameras");
      toast.error("Failed to fetch cameras");
      setCameras([]);
    } finally {
      setLoading(false);
    }
  }, [user, role]); 

  useEffect(() => {
    if (user) {
      fetchCameras();
    } else {
      // Clear cameras if no user is authenticated
      setCameras([]);
      setLoading(false);
    }
  }, [user, role, fetchCameras]);

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
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error loading cameras</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
            <button 
              onClick={fetchCameras}
              className="mt-3 px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 text-sm rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : cameras.length === 0 ? (
          <EmptyLiveView role={role || 'user'} />
        ) : (
          <LiveViewGrid cameras={cameras} layout={layout} />
        )}
      </div>
    </AppLayout>
  );
};

export default LiveView;
