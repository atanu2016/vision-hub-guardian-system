
import { useState } from "react";
import RecordingMetadata from "./recording-item/RecordingMetadata";
import RecordingActions from "./recording-item/RecordingActions";
import RecordingThumbnail from "./recording-item/RecordingThumbnail";
import PlayDialog from "./recording-item/PlayDialog";
import DeleteDialog from "./recording-item/DeleteDialog";
import { useRecordingItem } from "./recording-item/useRecordingItem";

interface RecordingItemProps {
  id: string;
  cameraName: string;
  date: string;
  time: string;
  duration: number;
  fileSize: string;
  type: "Scheduled" | "Motion" | "Manual";
  important: boolean;
  onDelete?: (id: string) => Promise<void>;
}

export default function RecordingListItem({
  id,
  cameraName,
  date,
  time,
  duration,
  fileSize,
  type,
  important,
  onDelete
}: RecordingItemProps) {
  const {
    isPlayDialogOpen,
    setIsPlayDialogOpen,
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    isDeleting,
    videoSource,
    handleDownload,
    handleDelete
  } = useRecordingItem({ id, cameraName, onDelete });

  return (
    <div 
      key={id}
      className="bg-secondary/25 rounded-lg p-4 flex flex-col sm:flex-row gap-4 border border-border"
    >
      <RecordingThumbnail onClick={() => setIsPlayDialogOpen(true)} />
      
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
        <RecordingMetadata 
          cameraName={cameraName}
          date={date}
          time={time}
          duration={duration}
          fileSize={fileSize}
          type={type}
          important={important}
        />
        
        <RecordingActions 
          onPlay={() => setIsPlayDialogOpen(true)}
          onDownload={handleDownload}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      </div>
      
      {/* Video Playback Dialog */}
      <PlayDialog 
        isOpen={isPlayDialogOpen}
        onOpenChange={setIsPlayDialogOpen}
        cameraName={cameraName}
        date={date}
        time={time}
        duration={duration}
        type={type}
        videoSource={videoSource}
        onDownload={handleDownload}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
    </div>
  );
}
