
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

interface DatePickerProps {
  selectedDate: Date | null;
  onSelect: (date?: Date) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const [month, setMonth] = useState<Date>(selectedDate || new Date());

  return (
    <div className="p-3">
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={onSelect}
        month={month}
        onMonthChange={setMonth}
        className="rounded-md border"
      />
    </div>
  );
}
