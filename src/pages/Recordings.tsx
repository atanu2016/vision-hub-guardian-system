
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import RecordingsSidebar from "@/components/recordings/RecordingsSidebar";
import RecordingsList from "@/components/recordings/RecordingsList";
import { useRecordings } from "@/hooks/useRecordings";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListFilter } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DatePicker } from "@/components/recordings/DatePicker";

const Recordings = () => {
  const {
    filteredRecordings,
    selectedCamera,
    setSelectedCamera,
    selectedType,
    setSelectedType,
    loading,
    cameras,
    storageUsed,
    deleteRecording,
    dateFilter,
    setDateFilter
  } = useRecordings();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDeleteRecording = async (recordingId: string) => {
    const success = await deleteRecording(recordingId);
    if (success) {
      toast.success("Recording deleted successfully");
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
            <p className="text-muted-foreground">
              View and manage your camera recordings
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <DatePicker
                  selectedDate={dateFilter}
                  onSelect={(date) => {
                    setDateFilter(date || null);
                    setIsDatePickerOpen(false);
                  }}
                />
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => {
                      setDateFilter(null);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Clear date filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Left sidebar */}
          <RecordingsSidebar 
            cameras={cameras}
            selectedCamera={selectedCamera}
            setSelectedCamera={setSelectedCamera}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            storageUsed={storageUsed}
            dateFilter={dateFilter}
            onClearDateFilter={() => setDateFilter(null)}
          />

          {/* Main content area */}
          <RecordingsList 
            recordings={filteredRecordings}
            loading={loading}
            onDeleteRecording={handleDeleteRecording}
            dateFilter={dateFilter}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Recordings;
