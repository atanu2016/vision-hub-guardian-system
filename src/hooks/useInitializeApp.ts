
import { useEffect } from "react";
import { initializeSampleCameras } from "@/services/database/camera/syncPublicCameras";
import { useAuth } from "@/contexts/auth";

export function useInitializeApp() {
  const { isAdmin, user } = useAuth();
  
  // Initialize app data
  useEffect(() => {
    const initializeData = async () => {
      if (user && isAdmin) {
        console.log("Admin user detected, initializing sample data if needed");
        await initializeSampleCameras();
      }
    };
    
    if (user) {
      initializeData();
    }
  }, [user, isAdmin]);
}
