
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

// Define the schema for recording schedules
const scheduleFormSchema = z.object({
  scheduleType: z.enum(['always', 'workdays', 'weekends', 'custom']),
  startTime: z.string().default('08:00'),
  endTime: z.string().default('20:00'),
  days: z.array(z.string()).default(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  motionOnly: z.boolean().default(false),
  quality: z.enum(['low', 'medium', 'high', 'ultra']).default('medium'),
  cameras: z.array(z.string()).optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export default function SchedulesContent() {
  const [loading, setLoading] = useState(false);

  // Initialize form with default values
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      scheduleType: 'always',
      startTime: '08:00',
      endTime: '20:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      motionOnly: false,
      quality: 'medium',
      cameras: [],
    },
  });
  
  const scheduleType = form.watch('scheduleType');
  
  // Mock function to save the schedule
  const onSubmit = async (data: ScheduleFormValues) => {
    setLoading(true);
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saving schedule configuration:", data);
      toast.success("Recording schedule saved successfully");
    } catch (error) {
      console.error("Failed to save schedule", error);
      toast.error("Failed to save recording schedule");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recording Schedule Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Schedule Type */}
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Type</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2" 
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                          <RadioGroupItem value="always" id="always" />
                          <Label htmlFor="always" className="cursor-pointer">Always (24/7)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                          <RadioGroupItem value="workdays" id="workdays" />
                          <Label htmlFor="workdays" className="cursor-pointer">Workdays (Mon-Fri)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                          <RadioGroupItem value="weekends" id="weekends" />
                          <Label htmlFor="weekends" className="cursor-pointer">Weekends (Sat-Sun)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent/50">
                          <RadioGroupItem value="custom" id="custom" />
                          <Label htmlFor="custom" className="cursor-pointer">Custom Schedule</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Time Range - show only for custom schedule */}
              {scheduleType === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Select 
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={loading}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Start Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <SelectItem 
                                    key={`start-${hour}`} 
                                    value={`${hour.toString().padStart(2, '0')}:00`}
                                  >
                                    {hour.toString().padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Clock className="absolute right-10 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Select 
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={loading}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="End Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }).map((_, hour) => (
                                  <SelectItem 
                                    key={`end-${hour}`} 
                                    value={`${hour.toString().padStart(2, '0')}:00`}
                                  >
                                    {hour.toString().padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Clock className="absolute right-10 top-3 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Days of Week - show only for custom schedule */}
              {scheduleType === 'custom' && (
                <FormField
                  control={form.control}
                  name="days"
                  render={() => (
                    <FormItem>
                      <FormLabel>Days of Week</FormLabel>
                      <div className="grid grid-cols-7 gap-2 pt-2">
                        {[
                          { day: 'mon', label: 'Mon' },
                          { day: 'tue', label: 'Tue' },
                          { day: 'wed', label: 'Wed' },
                          { day: 'thu', label: 'Thu' },
                          { day: 'fri', label: 'Fri' },
                          { day: 'sat', label: 'Sat' },
                          { day: 'sun', label: 'Sun' }
                        ].map(({ day, label }) => (
                          <div key={day} className="flex flex-col items-center">
                            <div className="mb-1">{label}</div>
                            <Switch
                              checked={form.watch('days').includes(day)}
                              onCheckedChange={(checked) => {
                                const currentDays = form.watch('days');
                                if (checked) {
                                  if (!currentDays.includes(day)) {
                                    form.setValue('days', [...currentDays, day]);
                                  }
                                } else {
                                  form.setValue('days', currentDays.filter(d => d !== day));
                                }
                              }}
                              disabled={loading}
                            />
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              )}
              
              {/* Motion Detection Only */}
              <FormField
                control={form.control}
                name="motionOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Motion Detection Only</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Record only when motion is detected during scheduled periods
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Recording Quality */}
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recording Quality</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (360p)</SelectItem>
                          <SelectItem value="medium">Medium (720p)</SelectItem>
                          <SelectItem value="high">High (1080p)</SelectItem>
                          <SelectItem value="ultra">Ultra HD (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => form.reset()} disabled={loading}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
