
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import CameraGrid from "@/components/cameras/CameraGrid";
import { mockCameraGroups, mockCameras } from "@/data/mockData";

const Cameras = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cameras</h1>
            <p className="text-muted-foreground">
              Manage and configure your camera system
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search cameras..."
                className="w-full md:w-64 pl-8 bg-secondary/50"
              />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Camera
            </Button>
          </div>
        </div>
        
        <div className="space-y-8">
          {mockCameraGroups.map((group) => (
            <CameraGrid
              key={group.id}
              cameras={group.cameras}
              title={group.name}
            />
          ))}

          <CameraGrid
            cameras={mockCameras.filter((camera) => 
              !mockCameraGroups.some((group) => 
                group.cameras.some((c) => c.id === camera.id)
              )
            )}
            title="Ungrouped"
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Cameras;
