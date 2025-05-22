
import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Camera } from "@/types/camera";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { getAccessibleCameras } from "@/services/userManagement/cameraAssignment";
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
        setLoading(false);
        return;
      }

      console.log("Fetching cameras for user", user.id);
      
      // Get user's accessible cameras
      const camerasData = await getAccessibleCameras(user.id, role || 'user');
      console.log(`Fetched ${camerasData.length} cameras for live view`);
      setCameras(camerasData);
    } catch (error: any) {
      console.error('Error fetching cameras for live view:', error);
      setError(error.message || "Failed to fetch cameras");
      toast.error("Failed to fetch cameras");
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

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
