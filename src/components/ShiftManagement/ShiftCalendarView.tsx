import React from "react";
import { cn } from "@/lib/utils";

interface ShiftCalendarViewProps {
  shifts: any[];
  className?: string;
}

const ShiftCalendarView: React.FC<ShiftCalendarViewProps> = ({
  shifts = [],
  className,
}) => {
  // Group shifts by day
  const shiftsByDay: Record<string, any[]> = {};

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const daysFr = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  days.forEach((day) => {
    shiftsByDay[day] = shifts.filter((shift) => shift.day === day);
  });

  // Get shift color based on type
  const getShiftColor = (type: string) => {
    switch (type) {
      case "morning":
        return "bg-blue-500";
      case "evening":
        return "bg-green-500";
      case "night":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={cn("bg-white rounded-lg p-4", className)}>
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {daysFr.map((day, index) => (
          <div
            key={day}
            className="text-center font-medium text-sm text-slate-600"
          >
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {days.map((day) => (
          <div key={day} className="h-24 border rounded-md p-1 overflow-hidden">
            {shiftsByDay[day].length > 0 ? (
              <div className="space-y-1">
                {shiftsByDay[day].map((shift, index) => (
                  <div
                    key={`${day}-${index}`}
                    className={cn(
                      "text-xs text-white p-1 rounded truncate",
                      getShiftColor(shift.shiftType),
                    )}
                    title={`${shift.employeeName}: ${shift.startTime}-${shift.endTime}`}
                  >
                    {shift.employeeName}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                -
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftCalendarView;
