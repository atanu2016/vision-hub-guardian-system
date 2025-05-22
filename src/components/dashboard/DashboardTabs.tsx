
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CameraControls, { SortKey, SortDirection } from "@/components/dashboard/CameraControls";
import CameraCard from "@/components/dashboard/CameraCard";
import RecordingCard from "@/components/dashboard/RecordingCard";
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cameraLoading ? (
            <>
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
            </>
          ) : sortedCameras.length > 0 ? (
            sortedCameras.map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))
          ) : (
            <div className="col-span-3 text-center">No cameras found.</div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="recordings" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recordingsLoading ? (
            <>
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="h-48 w-full rounded-md" />
            </>
          ) : recordings.length > 0 ? (
            recordings.slice(0, 6).map((recording) => (
              <RecordingCard key={recording.id} recording={recording} />
            ))
          ) : (
            <div className="col-span-3 text-center">No recordings found.</div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
