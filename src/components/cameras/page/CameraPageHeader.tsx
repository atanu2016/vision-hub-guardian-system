
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CameraPageHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openAddModal: () => void;
}

const CameraPageHeader = ({
  searchQuery,
  setSearchQuery,
  openAddModal,
}: CameraPageHeaderProps) => {
  return (
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button onClick={openAddModal}>
          <span className="mr-2">+</span>
          Add Camera
        </Button>
      </div>
    </div>
  );
};

export default CameraPageHeader;
