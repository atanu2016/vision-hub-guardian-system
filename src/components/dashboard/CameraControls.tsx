
import { Button } from "@/components/ui/button";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  CircleDashed,
  MapPin,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortKey = "name" | "location" | "status" | "lastSeen";
export type SortDirection = "asc" | "desc";

export interface CameraControlsProps {
  sortBy: SortKey;
  changeSortBy: (key: SortKey) => void;
  sortDirection: SortDirection;
  toggleSortDirection: () => void;
  groupBy: "none" | "group" | "location";
  setGroupBy: (groupBy: "none" | "group" | "location") => void;
}

const CameraControls = ({
  sortBy,
  changeSortBy,
  sortDirection,
  toggleSortDirection,
  groupBy,
  setGroupBy,
}: CameraControlsProps) => {
  const getSortIcon = () => {
    if (sortDirection === "asc") {
      return sortBy === "name" ? <ArrowDownAZ className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />;
    } else {
      return sortBy === "name" ? <ArrowUpZA className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <CircleDashed className="h-4 w-4" />
            <span className="hidden sm:inline">Group by</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Group Cameras</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => setGroupBy("none")}
              className={groupBy === "none" ? "bg-accent" : ""}
            >
              <span>None</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setGroupBy("location")}
              className={groupBy === "location" ? "bg-accent" : ""}
            >
              <MapPin className="h-4 w-4 mr-2" />
              <span>Location</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            {getSortIcon()}
            <span className="hidden sm:inline">Sort by</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort Cameras</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => changeSortBy("name")}
              className={sortBy === "name" ? "bg-accent" : ""}
            >
              <ArrowDownAZ className="h-4 w-4 mr-2" />
              <span>Name</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeSortBy("location")}
              className={sortBy === "location" ? "bg-accent" : ""}
            >
              <MapPin className="h-4 w-4 mr-2" />
              <span>Location</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeSortBy("status")}
              className={sortBy === "status" ? "bg-accent" : ""}
            >
              <CircleDashed className="h-4 w-4 mr-2" />
              <span>Status</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => changeSortBy("lastSeen")}
              className={sortBy === "lastSeen" ? "bg-accent" : ""}
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span>Last Seen</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleSortDirection}>
            {sortDirection === "asc" ? (
              <>
                <SortAsc className="h-4 w-4 mr-2" />
                <span>Ascending</span>
              </>
            ) : (
              <>
                <SortDesc className="h-4 w-4 mr-2" />
                <span>Descending</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CameraControls;
