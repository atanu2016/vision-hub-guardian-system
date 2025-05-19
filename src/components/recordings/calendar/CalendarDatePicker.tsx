
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  hasRecordings?: (date: Date) => boolean;
}

export default function CalendarDatePicker({ date, onSelect, hasRecordings }: CalendarDatePickerProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Generate array of days in the selected month
  const getDaysInMonth = (year: number, month: number): Date[] => {
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const daysInMonth = getDaysInMonth(year, month);
  
  // Generate last 3 years and next 3 years for year dropdown
  const years = Array.from({ length: 7 }, (_, i) => today.getFullYear() - 3 + i);
  
  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const handleDaySelect = (day: Date) => {
    onSelect(day);
    setCalendarOpen(false);
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
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Select
                value={month.toString()}
                onValueChange={(value) => setMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={name} value={index.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={year.toString()}
                onValueChange={(value) => setYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Add empty cells for days before the start of the month */}
            {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
              <div key={`empty-start-${i}`} className="h-8 w-8" />
            ))}
            
            {/* Days of the month */}
            {daysInMonth.map((day) => {
              const isSelected = date && day.toDateString() === date.toDateString();
              const isToday = day.toDateString() === today.toDateString();
              // Safely check if hasRecordings is provided and use it
              const hasRecording = hasRecordings ? hasRecordings(day) : false;
              
              return (
                <Button
                  key={day.toDateString()}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 p-0 font-normal",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isToday && !isSelected && "bg-accent text-accent-foreground",
                    hasRecording && !isSelected && "ring-1 ring-blue-400 dark:ring-blue-600 bg-blue-50 dark:bg-blue-900/30"
                  )}
                  onClick={() => handleDaySelect(day)}
                >
                  {day.getDate()}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
