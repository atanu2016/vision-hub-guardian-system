
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CameraControlsProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  groupBy: "none" | "group" | "location";
  setGroupBy: (groupBy: "none" | "group" | "location") => void;
}

const CameraControls = ({
  sortOption,
  setSortOption,
  sortOrder,
  setSortOrder,
  groupBy,
  setGroupBy,
}: CameraControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
      <TabsList>
        <TabsTrigger value="all">All Cameras</TabsTrigger>
        <TabsTrigger value="online">Online</TabsTrigger>
        <TabsTrigger value="offline">Offline</TabsTrigger>
        <TabsTrigger value="recording">Recording</TabsTrigger>
      </TabsList>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Sort & Group
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
              <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="location">Location</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="lastSeen">Last Seen</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
              <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Group by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={groupBy} onValueChange={(value) => setGroupBy(value as "none" | "group" | "location")}>
              <DropdownMenuRadioItem value="none">No Grouping</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="group">Camera Group</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="location">Location</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CameraControls;
