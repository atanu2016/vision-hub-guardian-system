
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera } from '@/types/camera';
import { useCameraSettings } from '@/hooks/useCameraSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCameraGroups } from '@/hooks/use-camera-groups';

const basicSchema = z.object({
  name: z.string().min(1, 'Camera name is required'),
  location: z.string().min(1, 'Camera location is required'),
  group: z.string().optional()
});

type BasicFormValues = z.infer<typeof basicSchema>;

interface BasicSettingsProps {
  camera: Camera;
  onSave: (values: any) => void;
  loading?: boolean;
}

export default function BasicSettings({ camera, onSave, loading = false }: BasicSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { updateCameraSettings } = useCameraSettings();
  const availableCameraGroups = useCameraGroups();
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const form = useForm<BasicFormValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      name: camera.name || '',
      location: camera.location || '',
      group: camera.group || ''
    }
  });

  const handleSubmit = async (values: BasicFormValues) => {
    try {
      setIsSaving(true);
      
      // If a new group was entered, use that
      const finalGroup = showNewGroupInput ? newGroupName : values.group;
      
      // Update camera settings with group included
      await updateCameraSettings(camera.id, {
        ...values,
        group: finalGroup
      });
      
      toast.success('Camera settings updated');
      onSave({
        ...values,
        group: finalGroup
      });
      
      // Reset new group input state
      setShowNewGroupInput(false);
      setNewGroupName('');
    } catch (error: any) {
      console.error('Error updating camera settings:', error);
      toast.error(error?.message || 'Failed to update camera settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewGroup = () => {
    setShowNewGroupInput(true);
  };

  const handleCancelNewGroup = () => {
    setShowNewGroupInput(false);
    setNewGroupName('');
  };

  const uniqueGroups = [
    ...new Set([
      'Uncategorized',
      ...(camera.group ? [camera.group] : []),
      ...availableCameraGroups
    ])
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Camera Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter camera name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter camera location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Camera Group Field */}
            {!showNewGroupInput ? (
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Camera Group</FormLabel>
                    <div className="flex gap-2">
                      <FormControl className="flex-grow">
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || 'Uncategorized'}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Camera Group" />
                          </SelectTrigger>
                          <SelectContent>
                            {uniqueGroups.map(group => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleAddNewGroup}>
                        Add New
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormItem>
                <FormLabel>New Camera Group</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter new group name" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="button" variant="outline" onClick={handleCancelNewGroup}>
                    Cancel
                  </Button>
                </div>
              </FormItem>
            )}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving || loading}>
                {isSaving || loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
