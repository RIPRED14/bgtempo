import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { cn } from "../../lib/utils";
import ShiftBlock from "./ShiftBlock";
import ShiftDialog from "./ShiftDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Define the ShiftBlockProps interface here instead of importing it
interface ShiftBlockProps {
  id?: string;
  employeeName?: string;
  startTime?: string;
  endTime?: string;
  shiftType?: "morning" | "evening" | "night";
  day?: string;
  onClick?: (e: React.MouseEvent) => void;
  isDraggable?: boolean;
}

interface WeeklyCalendarProps {
  shifts?: ShiftBlockProps[];
  onShiftUpdate?: (shift: ShiftBlockProps) => void;
  onShiftCreate?: (shift: ShiftBlockProps) => void;
  onShiftDelete?: (id: string) => void;
  filteredEmployee?: string;
  filteredDay?: string;
  filteredShiftType?: "morning" | "evening" | "night";
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAYS_OF_WEEK_FR = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`,
);

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  shifts = [
    {
      id: "shift-1",
      employeeName: "John Smith",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
      day: "Monday",
    },
    {
      id: "shift-2",
      employeeName: "Sarah Johnson",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
      day: "Monday",
    },
    {
      id: "shift-3",
      employeeName: "Mike Williams",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
      day: "Tuesday",
    },
    {
      id: "shift-4",
      employeeName: "Lisa Brown",
      startTime: "00:00",
      endTime: "07:00",
      shiftType: "night",
      day: "Friday",
    },
  ],
  onShiftUpdate = () => {},
  onShiftCreate = () => {},
  onShiftDelete = () => {},
  filteredEmployee,
  filteredDay,
  filteredShiftType,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedShift, setSelectedShift] = useState<ShiftBlockProps | null>(
    null,
  );
  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    hour: string;
  } | null>(null);

  // Filter shifts based on selected filters
  const filteredShifts = shifts.filter((shift) => {
    if (
      filteredEmployee &&
      filteredEmployee !== "all-employees" &&
      shift.employeeName !== filteredEmployee
    )
      return false;
    if (filteredDay && filteredDay !== "all-days" && shift.day !== filteredDay)
      return false;
    if (
      filteredShiftType &&
      filteredShiftType !== "all-shifts" &&
      shift.shiftType !== filteredShiftType
    )
      return false;
    return true;
  });

  const handleCellClick = (day: string, hour: string) => {
    setSelectedCell({ day, hour });
    setDialogMode("create");
    setSelectedShift(null);
    setDialogOpen(true);
  };

  const handleShiftClick = (shift: ShiftBlockProps) => {
    setDialogMode("edit");
    setSelectedShift(shift);
    setDialogOpen(true);
  };

  const handleDialogSave = (data: any) => {
    if (dialogMode === "create") {
      onShiftCreate({
        id: `shift-${Date.now()}`,
        employeeName: data.employee,
        employeeId: data.employeeId || "emp-1", // Add employeeId with default
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        shiftType: data.shiftType,
      });
    } else {
      onShiftUpdate({
        ...selectedShift,
        employeeName: data.employee,
        employeeId: data.employeeId || "emp-1", // Add employeeId with default
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        shiftType: data.shiftType,
      });
    }
  };

  // Set up drop targets for each cell
  const [, drop] = useDrop(() => ({
    accept: "SHIFT",
    drop: (item: ShiftBlockProps, monitor) => {
      // Get the drop target element
      const dropTarget = monitor.getDropTargetElement();
      if (!dropTarget) return;

      // Extract day and hour from the drop target's key attribute
      const targetId = dropTarget.getAttribute("data-cell-id");
      if (!targetId) return;

      const [day, hour] = targetId.split("-");

      // Calculate the hours covered by the shift
      const startHour = parseInt(hour.split(":")[0]);
      const endHour = calculateEndHour(startHour, item.shiftType || "morning");

      // Create a new shift at the drop location
      onShiftCreate({
        id: `shift-${Date.now()}`,
        employeeName: item.employeeName || "",
        employeeId: item.employeeId || "emp-1", // Use the original employee ID if available
        day,
        startTime: hour,
        endTime: `${endHour}:00`,
        shiftType: item.shiftType || "morning",
      });

      // If this was a move operation, delete the original shift
      if (item.id) {
        // Add a small delay to ensure the new shift is created before deleting the old one
        setTimeout(() => {
          onShiftDelete(item.id as string);
        }, 100);
      }

      return { moved: true };
    },
    hover: (item: ShiftBlockProps, monitor) => {
      // Show a preview of where the shift would be placed
      const dropTarget = monitor.getDropTargetElement();
      if (!dropTarget) return;

      // We could add visual feedback here if needed
    },
    canDrop: (item: ShiftBlockProps, monitor) => {
      const dropTarget = monitor.getDropTargetElement();
      if (!dropTarget) return false;

      const targetId = dropTarget.getAttribute("data-cell-id");
      if (!targetId) return false;

      const [day, hour] = targetId.split("-");
      const hourNum = parseInt(hour.split(":")[0]);

      // Check if this is within operating hours
      return isWithinOperatingHours(day, hour);
    },
  }));

  // Helper function to calculate end hour based on shift type
  const calculateEndHour = (startHour: number, shiftType: string): number => {
    switch (shiftType) {
      case "morning":
        return startHour + 6 > 23 ? startHour + 6 - 24 : startHour + 6;
      case "evening":
        return startHour + 7 > 23 ? startHour + 7 - 24 : startHour + 7;
      case "night":
        return startHour + 7 > 23 ? startHour + 7 - 24 : startHour + 7;
      default:
        return startHour + 6 > 23 ? startHour + 6 - 24 : startHour + 6;
    }
  };

  // Helper function to position shifts in the grid
  const getShiftPosition = (shift: ShiftBlockProps) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(shift.day || "Monday");
    const startHour = parseInt((shift.startTime || "00:00").split(":")[0]);
    return { dayIndex, startHour };
  };

  // Helper function to calculate shift duration in hours
  const calculateShiftDuration = (
    startTime: string,
    endTime: string,
  ): number => {
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);

    if (endHour > startHour) {
      return endHour - startHour;
    } else {
      // Handle overnight shifts
      return 24 - startHour + endHour;
    }
  };

  // Helper function to check if a shift should be displayed in a cell
  const shouldDisplayShift = (
    day: string,
    hour: string,
    shift: ShiftBlockProps,
  ) => {
    if (shift.day !== day) return false;

    const cellHour = parseInt(hour.split(":")[0]);
    const shiftStartHour = parseInt((shift.startTime || "00:00").split(":")[0]);
    const shiftEndHour = parseInt((shift.endTime || "00:00").split(":")[0]);

    // For overnight shifts where end hour is less than start hour
    if (shiftEndHour < shiftStartHour) {
      // Display the shift in all cells between start hour and midnight,
      // and between midnight and end hour
      return cellHour === shiftStartHour;
    }

    return cellHour === shiftStartHour;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 overflow-auto h-full">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 gap-2 mb-2 sticky top-0 bg-white z-10">
        <div className="font-bold text-slate-500 p-2">Heures</div>
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={day} className="font-bold text-center p-2">
            {DAYS_OF_WEEK_FR[index]}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-8 gap-2">
        {/* Hours column */}
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="font-medium text-slate-500 p-2 text-right">
              {hour}
            </div>
            {/* Day cells for this hour */}
            {DAYS_OF_WEEK.map((day) => {
              // Check if this day/hour is within restaurant operating hours
              const isOperatingHour = isWithinOperatingHours(day, hour);

              return (
                <div
                  key={`${day}-${hour}`}
                  data-cell-id={`${day}-${hour}`}
                  className={cn(
                    "border rounded-md p-2 min-h-20 relative transition-colors",
                    isOperatingHour
                      ? "bg-slate-50 cursor-pointer hover:bg-slate-100"
                      : "bg-slate-200",
                  )}
                  ref={isOperatingHour ? drop : null}
                  onClick={() => isOperatingHour && handleCellClick(day, hour)}
                >
                  {/* Render shifts that start at this hour/day */}
                  {filteredShifts
                    .filter((shift) => shouldDisplayShift(day, hour, shift))
                    .map((shift) => (
                      <ShiftBlock
                        key={shift.id}
                        {...shift}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShiftClick(shift);
                        }}
                      />
                    ))}

                  {/* Add shift button for empty cells */}
                  {isOperatingHour &&
                    filteredShifts.filter((shift) =>
                      shouldDisplayShift(day, hour, shift),
                    ).length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-white shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(day, hour);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Shift Dialog */}
      <ShiftDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        shiftData={{
          id: selectedShift?.id,
          employee: selectedShift?.employeeName || "",
          day: selectedShift?.day || selectedCell?.day || "Monday",
          startTime: selectedShift?.startTime || selectedCell?.hour || "11:00",
          endTime: selectedShift?.endTime || "17:00",
          shiftType: selectedShift?.shiftType || "morning",
        }}
        onSave={handleDialogSave}
        onDelete={onShiftDelete}
      />
    </div>
  );
};

// Helper function to check if a time is within restaurant operating hours
const isWithinOperatingHours = (day: string, hour: string): boolean => {
  const hourNum = parseInt(hour.split(":")[0]);

  // Sun-Wed: 11h-2h
  if (["Sunday", "Monday", "Tuesday", "Wednesday"].includes(day)) {
    return hourNum >= 11 || hourNum < 2;
  }
  // Thu-Sat: 11h-7h
  else {
    return hourNum >= 11 || hourNum < 7;
  }
};

export default WeeklyCalendar;
