
import { Badge } from "@/components/ui/badge";
import { RecordingTimeframeProps } from "./types";

export default function TimeframeSelector({ 
  selectedTimeframe, 
  setSelectedTimeframe 
}: RecordingTimeframeProps) {
  return (
    <div className="mb-2 flex items-center">
      <h4 className="text-sm font-semibold">Timeframe</h4>
      <div className="ml-2 flex gap-1">
        <Badge 
          variant={selectedTimeframe === 'morning' ? "default" : "outline"} 
          className="cursor-pointer"
          onClick={() => setSelectedTimeframe('morning')}
        >
          Morning
        </Badge>
        <Badge 
          variant={selectedTimeframe === 'afternoon' ? "default" : "outline"} 
          className="cursor-pointer"
          onClick={() => setSelectedTimeframe('afternoon')}
        >
          Afternoon
        </Badge>
        <Badge 
          variant={selectedTimeframe === 'evening' ? "default" : "outline"} 
          className="cursor-pointer"
          onClick={() => setSelectedTimeframe('evening')}
        >
          Evening
        </Badge>
      </div>
    </div>
  );
}
