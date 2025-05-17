
import AppLayout from "@/components/layout/AppLayout";
import RecordingsSidebar from "@/components/recordings/RecordingsSidebar";
import RecordingsList from "@/components/recordings/RecordingsList";
import { useRecordings } from "@/hooks/useRecordings";

const Recordings = () => {
  const {
    filteredRecordings,
    selectedCamera,
    setSelectedCamera,
    selectedType,
    setSelectedType,
    loading,
    cameras,
    storageUsed
  } = useRecordings();

  return (
    <AppLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recordings</h1>
          <p className="text-muted-foreground">
            View and manage your camera recordings
          </p>
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
          />

          {/* Main content area */}
          <RecordingsList 
            recordings={filteredRecordings}
            loading={loading}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Recordings;
