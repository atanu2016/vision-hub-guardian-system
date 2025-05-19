
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface CameraGroupSelectorProps {
  cameraId: string;
  currentGroup?: string | null;
  onGroupChange: (group: string) => void;
}

const CameraGroupSelector: React.FC<CameraGroupSelectorProps> = ({ 
  cameraId, 
  currentGroup, 
  onGroupChange 
}) => {
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>(currentGroup || 'Ungrouped');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [creating, setCreating] = useState(false);

  // Load all existing camera groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('cameras')
          .select('group')
          .not('group', 'is', null);
          
        if (error) throw error;
        
        // Extract unique groups
        const groups = data
          .map(camera => camera.group)
          .filter((group): group is string => !!group)
          // Remove duplicates
          .filter((group, index, self) => self.indexOf(group) === index);
          
        // Add "Ungrouped" option
        setAvailableGroups(['Ungrouped', ...groups]);
        
        // Set selected group 
        setSelectedGroup(currentGroup || 'Ungrouped');
      } catch (error) {
        console.error("Failed to load camera groups:", error);
      }
    };
    
    loadGroups();
  }, [currentGroup]);

  // Handle group selection change
  const handleGroupChange = async (value: string) => {
    setSelectedGroup(value);
    
    try {
      // If "Ungrouped" is selected, set group to null
      const groupValue = value === 'Ungrouped' ? null : value;
      
      // Update camera group in the database
      const { error } = await supabase
        .from('cameras')
        .update({ group: groupValue })
        .eq('id', cameraId);
        
      if (error) throw error;
      
      onGroupChange(value);
      toast.success(`Camera moved to group: ${value}`);
    } catch (error) {
      console.error("Failed to update camera group:", error);
      toast.error("Failed to update camera group");
    }
  };

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    setCreating(true);
    
    try {
      // Update camera with new group
      const { error } = await supabase
        .from('cameras')
        .update({ group: newGroupName.trim() })
        .eq('id', cameraId);
        
      if (error) throw error;
      
      // Update UI
      setAvailableGroups(prev => [...prev, newGroupName.trim()]);
      setSelectedGroup(newGroupName.trim());
      setNewGroupName('');
      onGroupChange(newGroupName.trim());
      
      toast.success(`Camera added to new group: ${newGroupName.trim()}`);
    } catch (error) {
      console.error("Failed to create camera group:", error);
      toast.error("Failed to create camera group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="camera-group">Camera Group</Label>
        <Select value={selectedGroup} onValueChange={handleGroupChange}>
          <SelectTrigger id="camera-group">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {availableGroups.map(group => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="new-group">Create New Group</Label>
        <div className="flex gap-2">
          <Input 
            id="new-group" 
            value={newGroupName} 
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter new group name"
          />
          <Button 
            onClick={handleCreateGroup} 
            disabled={creating || !newGroupName.trim()}
            size="sm"
          >
            {creating ? "Creating..." : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraGroupSelector;
