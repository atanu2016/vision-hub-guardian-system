
import { Button } from "@/components/ui/button";

interface SampleCameraToggleProps {
  includeSampleCamera: boolean;
  toggleSampleCamera: () => void;
}

const SampleCameraToggle = ({
  includeSampleCamera,
  toggleSampleCamera,
}: SampleCameraToggleProps) => {
  // Return null since we're removing the sample camera functionality
  return null;
  
  // Original component code is kept for reference but not used
  /* 
  return (
    <div className="flex justify-end mb-4">
      <Button
        onClick={toggleSampleCamera}
        className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/90 rounded-md"
      >
        {includeSampleCamera ? "Hide Sample Stream" : "Show Sample Stream"}
      </Button>
    </div>
  );
  */
};

export default SampleCameraToggle;
