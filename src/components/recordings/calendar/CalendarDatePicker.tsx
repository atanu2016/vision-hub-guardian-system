
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subYears, addYears } from "date-fns";
import { useState } from "react";

interface CalendarDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  hasRecordings?: (date: Date) => boolean;
}

export default function CalendarDatePicker({ date, onSelect, hasRecordings }: CalendarDatePickerProps) {
  const today = new Date();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Set calendar range to 3.5 years before and 3.5 years after current date
  const fromDate = subYears(today, 3);
  const toDate = addYears(today, 3);
  
  // Custom day rendering to highlight dates with recordings
  const getDayClassNames = (day: Date) => {
    const hasRecordingClass = hasRecordings?.(day) 
      ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700" 
      : "";
    return hasRecordingClass;
  };

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect(selectedDate);
            setCalendarOpen(false);
          }}
          fromDate={fromDate}
          toDate={toDate}
          initialFocus
          className="pointer-events-auto"
          modifiersClassNames={{
            selected: "bg-primary text-primary-foreground",
            today: "bg-accent text-accent-foreground"
          }}
          modifiers={{
            hasRecording: (day) => hasRecordings?.(day) || false
          }}
          components={{
            Day: ({ day, ...props }: React.ComponentProps<typeof Calendar.Day> & { day: Date }) => (
              <div
                {...props}
                className={cn(props.className || "", getDayClassNames(day))}
              />
            )
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
