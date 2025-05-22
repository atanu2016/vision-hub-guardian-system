
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const RecordingManagement = () => {
  const navigate = useNavigate();

  const handleViewAllRecordings = () => {
    navigate('/recordings');
  };

  return (
    <div className="flex flex-col space-y-2 p-6 bg-card border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Recording Management</h2>
      <p className="text-muted-foreground mb-6">
        View and manage your recording history, including all recorded footage from your cameras
      </p>
      
      <div className="flex gap-4 mt-2">
        <Button 
          onClick={handleViewAllRecordings} 
          className="gap-2"
        >
          <ListFilter className="h-4 w-4" />
          View All Recordings
        </Button>
      </div>
    </div>
  );
};

export default RecordingManagement;
