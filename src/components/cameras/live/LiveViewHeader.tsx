
import React from "react";
import { Grid2X2, Grid3X3, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveViewHeaderProps {
  layout: "grid-2" | "grid-4" | "grid-9";
  setLayout: (layout: "grid-2" | "grid-4" | "grid-9") => void;
  onRefresh: () => void;
}

const LiveViewHeader: React.FC<LiveViewHeaderProps> = ({
  layout,
  setLayout,
  onRefresh,
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Live View</h1>
      <div className="flex items-center gap-2">
        <Button 
          variant={layout === "grid-2" ? "secondary" : "outline"} 
          size="icon"
          onClick={() => setLayout("grid-2")}
          className="h-8 w-8"
        >
          <Grid2X2 className="h-4 w-4" />
        </Button>
        <Button 
          variant={layout === "grid-4" ? "secondary" : "outline"} 
          size="icon"
          onClick={() => setLayout("grid-4")}
          className="h-8 w-8"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button 
          variant={layout === "grid-9" ? "secondary" : "outline"} 
          size="icon"
          onClick={() => setLayout("grid-9")}
          className="h-8 w-8"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="ml-2"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default LiveViewHeader;
