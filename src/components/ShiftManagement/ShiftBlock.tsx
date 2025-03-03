import React from "react";
import { useDrag } from "react-dnd";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Clock } from "lucide-react";

export interface ShiftBlockProps {
  id?: string;
  employeeName?: string;
  employeeId?: string;
  startTime?: string;
  endTime?: string;
  shiftType?: "morning" | "evening" | "night";
  day?: string;
  onClick?: (e: React.MouseEvent) => void;
  isDraggable?: boolean;
}

const ShiftBlock: React.FC<ShiftBlockProps> = ({
  id = "shift-1",
  employeeName = "John Doe",
  employeeId = "emp-1",
  startTime = "11:00",
  endTime = "17:00",
  shiftType = "morning",
  day = "Monday",
  onClick = () => {},
  isDraggable = true,
}) => {
  // Determine background color based on shift type
  const shiftColors = {
    morning: "bg-blue-500 hover:bg-blue-600",
    evening: "bg-green-500 hover:bg-green-600",
    night: "bg-orange-500 hover:bg-orange-600",
  };

  // Get day name in French
  const getDayNameFr = (day: string): string => {
    const dayMap: Record<string, string> = {
      Monday: "Lundi",
      Tuesday: "Mardi",
      Wednesday: "Mercredi",
      Thursday: "Jeudi",
      Friday: "Vendredi",
      Saturday: "Samedi",
      Sunday: "Dimanche",
    };
    return dayMap[day] || day;
  };

  // Get shift type in French
  const getShiftTypeFr = (type: string): string => {
    const typeMap: Record<string, string> = {
      morning: "Matin",
      evening: "Soir",
      night: "Nuit",
    };
    return typeMap[type] || type;
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SHIFT",
    item: {
      id,
      employeeName,
      employeeId,
      startTime,
      endTime,
      shiftType,
      day,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: isDraggable,
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        // The item was dropped outside of a drop target
        console.log("Shift was dropped outside a valid drop target");
      }
    },
    // Add a preview to show what's being dragged
    previewOptions: {
      offsetX: 0,
      offsetY: 0,
    },
  }));

  // Add a visual effect when dragging
  const dragStyle = isDragging
    ? {
        opacity: 0.5,
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
        transform: "scale(1.05)",
        cursor: "grabbing",
      }
    : {};

  // Calculate shift duration to adjust the height
  const calculateHeight = () => {
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    let hours = 0;

    if (endHour > startHour) {
      hours = endHour - startHour;
    } else {
      // Handle overnight shifts
      hours = 24 - startHour + endHour;
    }

    // Smaller height to fit more shifts
    return Math.max(60, 60 + (hours - 1) * 15);
  };

  // Get shift duration for display
  const getShiftDuration = () => {
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    let hours = 0;

    if (endHour > startHour) {
      hours = endHour - startHour;
    } else {
      // Handle overnight shifts
      hours = 24 - startHour + endHour;
    }

    return `${hours}h`;
  };

  return (
    <div
      className={cn(
        "rounded-md p-1 cursor-pointer text-white shadow-md transition-all",
        shiftColors[shiftType],
        isDragging ? "opacity-50" : "opacity-100",
        "w-full max-w-full",
      )}
      onClick={onClick}
      ref={isDraggable ? drag : null}
      style={{
        touchAction: "none",
        height: `${calculateHeight()}px`,
        ...dragStyle,
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center gap-1">
                <div
                  className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeName.replace(/ /g, "")}')`,
                  }}
                >
                  {/* Initials as fallback */}
                  {employeeName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>
                <div className="font-medium truncate text-xs">
                  {employeeName}
                </div>
              </div>
              <div className="text-xs flex items-center">
                <Clock className="h-3 w-3 mr-1 opacity-80" />
                {startTime}-{endTime} ({getShiftDuration()})
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeName.replace(/ /g, "")}')`,
                  }}
                >
                  {employeeName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>
                <p className="font-bold">{employeeName}</p>
              </div>
              <p>
                {getDayNameFr(day)}: {startTime} - {endTime} (
                {getShiftDuration()})
              </p>
              <p className="capitalize">{getShiftTypeFr(shiftType)}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ShiftBlock;
