
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Recording } from "../types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle recording operations like delete
 */
export const useRecordingOperations = (
  recordings: Recording[],
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>,
  updateStorageAfterDelete: (recordings: Recording[], id: string) => void
) => {
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  /**
   * Delete a recording by ID
   */
  const deleteRecording = useCallback(async (id: string) => {
    try {
      setIsOperationInProgress(true);
      
      // Delete from database
      const { error } = await supabase
        .from('recordings')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setRecordings((prev) => prev.filter((recording) => recording.id !== id));
      
      // Update storage used
      updateStorageAfterDelete(recordings, id);
      
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
      return false;
    } finally {
      setIsOperationInProgress(false);
    }
  }, [recordings, setRecordings, updateStorageAfterDelete]);

  return {
    deleteRecording,
    isOperationInProgress
  };
};
