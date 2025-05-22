
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  Terminal
} from "lucide-react";

export type SortKey = 'name' | 'location' | 'status' | 'lastSeen';
export type SortDirection = 'asc' | 'desc';

export interface CameraControlsProps {
  onSortChange: (key: SortKey) => void;
  currentSort: SortKey;
  onSortDirectionToggle: () => void;
  currentSortDirection: SortDirection;
  onGroupChange: () => void;
  currentGrouping: 'none' | 'location';
}

const CameraControls = ({
  onSortChange,
  currentSort,
  onSortDirectionToggle,
  currentSortDirection,
  onGroupChange,
  currentGrouping
}: CameraControlsProps) => {
  const getSortLabel = (key: SortKey): string => {
    switch (key) {
      case 'name': return 'Name';
      case 'location': return 'Location';
      case 'status': return 'Status';
      case 'lastSeen': return 'Last Seen';
      default: return 'Name';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <SortAsc className="h-3.5 w-3.5" />
            <span>Sort: {getSortLabel(currentSort)}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange('name')}>
            Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('location')}>
            Location
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('status')}>
            Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('lastSeen')}>
            Last Seen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort direction toggle */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onSortDirectionToggle}
      >
        {currentSortDirection === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>

      {/* Group toggle */}
      <Button
        variant="outline" 
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onGroupChange}
      >
        {currentGrouping === 'none' ? (
          <List className="h-4 w-4" />
        ) : (
          <Grid className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default CameraControls;
