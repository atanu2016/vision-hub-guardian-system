
import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Volume2, VolumeX } from "lucide-react";

interface StreamControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  error: string | null;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

export const StreamControls: React.FC<StreamControlsProps> = ({
  isPlaying,
  isMuted,
  error,
  onTogglePlay,
  onToggleMute,
}) => {
  if (error) return null;
  
  return (
    <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <div className="flex gap-1 bg-vision-dark-900/70 backdrop-blur-sm rounded-md p-1">
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={onTogglePlay}
          disabled={!!error}
        >
          {isPlaying ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};
