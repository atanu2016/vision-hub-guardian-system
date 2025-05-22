
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import AddCameraModal from "@/components/cameras/AddCameraModal";
import CameraPageHeader from "@/components/cameras/page/CameraPageHeader";
import SampleCameraToggle from "@/components/cameras/page/SampleCameraToggle";
import CameraLoadingState from "@/components/cameras/page/CameraLoadingState";
import NoCamerasFound from "@/components/cameras/page/NoCamerasFound";
import CameraGroups from "@/components/cameras/page/CameraGroups";
import { useCameraData } from "@/hooks/useCameraData";
import { useFilteredCameras } from "@/hooks/useFilteredCameras";

const Cameras = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const {
    cameras,
    loading,
    includeSampleCamera,
    toggleSampleCamera,
    cameraGroups,
    existingGroups,
    addCamera,
    handleDeleteCamera
  } = useCameraData();

  // Filter cameras based on search query
  const filteredCameraGroups = useFilteredCameras(cameraGroups);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-full">
        {/* Header with search and add camera button */}
        <CameraPageHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openAddModal={() => setIsAddModalOpen(true)}
        />
        
        {/* Sample camera toggle button */}
        <SampleCameraToggle 
          includeSampleCamera={includeSampleCamera}
          toggleSampleCamera={toggleSampleCamera}
        />
        
        {/* Loading state */}
        {loading ? (
          <CameraLoadingState />
        ) : (
          <div className="space-y-8">
            {/* Camera groups display */}
            <CameraGroups 
              groups={filteredCameraGroups} 
              onDeleteCamera={handleDeleteCamera} 
            />
            
            {/* Empty state when no cameras are found */}
            {filteredCameraGroups.length === 0 && (
              <NoCamerasFound 
                camerasExist={cameras.length > 0}
                onAddCamera={() => setIsAddModalOpen(true)}
              />
            )}
          </div>
        )}
      </div>
      
      {/* Add camera modal */}
      <AddCameraModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addCamera as any}
        existingGroups={existingGroups}
      />
    </AppLayout>
  );
};

export default Cameras;
