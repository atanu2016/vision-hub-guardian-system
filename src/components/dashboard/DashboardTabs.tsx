
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CameraControls, { SortKey, SortDirection } from "@/components/dashboard/CameraControls";
import CameraTabContent from "@/components/dashboard/CameraTabContent";
import RecordingTabContent from "@/components/dashboard/RecordingTabContent";
import { Camera } from "@/types/camera";
import { Recording } from "@/hooks/recordings/types";

interface DashboardTabsProps {
  cameras: Camera[];
  recordings: Recording[];
  cameraLoading: boolean;
  recordingsLoading: boolean;
  sortBy: SortKey;
  sortDirection: SortDirection;
  grouping: 'none' | 'location';
  sortedCameras: Camera[];
  changeSortBy: (key: SortKey) => void;
  toggleSortDirection: () => void;
  setGrouping: (grouping: 'none' | 'location') => void;
}

const DashboardTabs = ({
  cameras,
  recordings,
  cameraLoading,
  recordingsLoading,
  sortBy,
  sortDirection,
  grouping,
  sortedCameras,
  changeSortBy,
  toggleSortDirection,
  setGrouping
}: DashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState("cameras");

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="cameras">All Cameras</TabsTrigger>
          <TabsTrigger value="recordings">Recent Recordings</TabsTrigger>
        </TabsList>
        <div className="items-center flex gap-2">
          <CameraControls 
            sortBy={sortBy}
            changeSortBy={changeSortBy}
            sortDirection={sortDirection}
            toggleSortDirection={toggleSortDirection}
            groupBy={grouping}
            setGroupBy={() => setGrouping(grouping === 'none' ? 'location' : 'none')}
          />
        </div>
      </div>
      
      <TabsContent value="cameras" className="space-y-4">
        <CameraTabContent 
          loading={cameraLoading}
          cameras={sortedCameras}
        />
      </TabsContent>
      
      <TabsContent value="recordings" className="space-y-4">
        <RecordingTabContent
          loading={recordingsLoading}
          recordings={recordings}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
