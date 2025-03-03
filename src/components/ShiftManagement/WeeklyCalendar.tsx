import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { cn } from "../../lib/utils";
import ShiftBlock from "./ShiftBlock";
import ShiftDialog from "./ShiftDialog";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import AvatarGroup from "./AvatarGroup";

// Define the ShiftBlockProps interface here instead of importing it
interface ShiftBlockProps {
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

// Only show operating hours to maximize space
const HOURS = [
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
];

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

    // Show a helpful notification for first-time users
    if (localStorage.getItem("firstTimeAddingShift") !== "true") {
      if (window.showNotification) {
        window.showNotification({
          title: "Astuce",
          description:
            "Vous pouvez aussi glisser-déposer les shifts entre les cellules du calendrier.",
          variant: "info",
          position: "bottom-right",
          autoCloseDelay: 8000,
        });
        localStorage.setItem("firstTimeAddingShift", "true");
      }
    }
  };

  const handleShiftClick = (shift: ShiftBlockProps) => {
    setDialogMode("edit");
    setSelectedShift(shift);
    setDialogOpen(true);
  };

  const handleDialogSave = (data: any) => {
    try {
      // Show a loading indicator
      const loadingToast = document.createElement("div");
      loadingToast.className =
        "fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
      loadingToast.innerHTML = `
        <div class="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
        <span>${dialogMode === "create" ? "Création" : "Modification"} du shift en cours...</span>
      `;
      document.body.appendChild(loadingToast);

      if (dialogMode === "create") {
        // Create new shift
        const newShift = {
          id: `shift-${Date.now()}`,
          employeeName: data.employee,
          employeeId: data.employeeId || "emp-1", // Add employeeId with default
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          shiftType: data.shiftType,
        };

        // Verify the data is valid
        if (
          !newShift.employeeName ||
          !newShift.day ||
          !newShift.startTime ||
          !newShift.endTime
        ) {
          throw new Error("Données de shift incomplètes");
        }

        onShiftCreate(newShift);
      } else if (selectedShift) {
        // Update existing shift
        const updatedShift = {
          ...selectedShift,
          employeeName: data.employee,
          employeeId: data.employeeId || "emp-1", // Add employeeId with default
          day: data.day,
          startTime: data.startTime,
          endTime: data.endTime,
          shiftType: data.shiftType,
        };

        // Verify the data is valid
        if (
          !updatedShift.employeeName ||
          !updatedShift.day ||
          !updatedShift.startTime ||
          !updatedShift.endTime
        ) {
          throw new Error("Données de shift incomplètes");
        }

        onShiftUpdate(updatedShift);
      }

      // Remove loading indicator after a short delay
      setTimeout(() => {
        document.body.removeChild(loadingToast);

        // Show success message
        const successToast = document.createElement("div");
        successToast.className =
          "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
        successToast.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>Shift ${dialogMode === "create" ? "créé" : "modifié"} avec succès</span>
        `;
        document.body.appendChild(successToast);

        // Remove success message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
      }, 500);
    } catch (error) {
      console.error("Error saving shift:", error);

      // Show error message
      const errorToast = document.createElement("div");
      errorToast.className =
        "fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
      errorToast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>Erreur lors de l'enregistrement du shift</span>
      `;
      document.body.appendChild(errorToast);

      // Remove error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorToast);
      }, 3000);
    }
  };

  // Set up drop targets for each cell
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
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

      // Show a loading indicator using the notification service if available
      let notificationId;
      if (window.showNotification) {
        notificationId = window.showNotification({
          title: "Déplacement en cours",
          description: "Déplacement du shift en cours...",
          variant: "info",
          position: "bottom-right",
          autoClose: false,
        });
      } else {
        // Fallback to the old method
        const loadingToast = document.createElement("div");
        loadingToast.className =
          "fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
        loadingToast.innerHTML = `
          <div class="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
          <span>Déplacement du shift en cours...</span>
        `;
        document.body.appendChild(loadingToast);
      }

      try {
        // Create a new shift at the drop location
        const newShift = {
          id: `shift-${Date.now()}`,
          employeeName: item.employeeName || "",
          employeeId: item.employeeId || "emp-1", // Use the original employee ID if available
          day,
          startTime: hour,
          endTime: `${endHour}:00`,
          shiftType: item.shiftType || "morning",
        };

        onShiftCreate(newShift);

        // If this was a move operation, delete the original shift
        if (item.id) {
          // Add a small delay to ensure the new shift is created before deleting the old one
          setTimeout(() => {
            onShiftDelete(item.id as string);

            // Show success message using the notification service if available
            if (window.showNotification) {
              // Dismiss the loading notification if it exists
              if (notificationId && window.dismissNotification) {
                window.dismissNotification(notificationId);
              }

              window.showNotification({
                title: "Déplacement réussi",
                description: `Shift de ${item.employeeName} déplacé avec succès`,
                variant: "success",
                position: "bottom-right",
              });
            } else {
              // Fallback to the old method
              document.body.removeChild(loadingToast);

              const successToast = document.createElement("div");
              successToast.className =
                "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
              successToast.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Shift déplacé avec succès</span>
              `;
              document.body.appendChild(successToast);

              // Remove success message after 3 seconds
              setTimeout(() => {
                document.body.removeChild(successToast);
              }, 3000);
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error moving shift:", error);
        // Show error message using the notification service if available
        if (window.showNotification) {
          // Dismiss the loading notification if it exists
          if (notificationId && window.dismissNotification) {
            window.dismissNotification(notificationId);
          }

          window.showNotification({
            title: "Erreur",
            description: "Erreur lors du déplacement du shift",
            variant: "error",
            position: "bottom-right",
          });
        } else {
          // Fallback to the old method
          document.body.removeChild(loadingToast);

          const errorToast = document.createElement("div");
          errorToast.className =
            "fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
          errorToast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>Erreur lors du déplacement du shift</span>
          `;
          document.body.appendChild(errorToast);

          // Remove error message after 3 seconds
          setTimeout(() => {
            document.body.removeChild(errorToast);
          }, 3000);
        }
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
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
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

  // Get current day of week
  const getCurrentDayOfWeek = (): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  // Current day for highlighting
  const currentDay = getCurrentDayOfWeek();

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
      return cellHour >= shiftStartHour || cellHour < shiftEndHour;
    }

    // For regular shifts, display if cell hour is within the shift range
    return cellHour >= shiftStartHour && cellHour < shiftEndHour;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 overflow-auto h-full w-full max-w-full">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 gap-1 mb-2 sticky top-0 bg-white z-10">
        <div className="font-bold text-slate-500 p-2">Heures</div>
        {DAYS_OF_WEEK.map((day, index) => (
          <div
            key={day}
            className={cn(
              "font-bold text-center p-2",
              day === currentDay ? "bg-blue-100 text-blue-800 rounded-md" : "",
            )}
          >
            {DAYS_OF_WEEK_FR[index]}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-8 gap-1">
        {/* Hours column */}
        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="font-medium text-slate-500 p-1 text-right text-xs">
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
                    "border rounded-md p-1 min-h-16 relative transition-colors",
                    isOperatingHour
                      ? "bg-slate-50 cursor-pointer hover:bg-slate-100"
                      : "bg-slate-200",
                    // Highlight current hour
                    new Date().getHours() === parseInt(hour)
                      ? "border-blue-500 border-2"
                      : "",
                    // Highlight current day
                    day === currentDay ? "bg-blue-50" : "",
                    // Highlight drop target
                    isOver && canDrop
                      ? "bg-green-100 border-green-500 border-2"
                      : "",
                    isOver && !canDrop
                      ? "bg-red-100 border-red-500 border-2"
                      : "",
                  )}
                  ref={isOperatingHour ? drop : null}
                  onClick={() => isOperatingHour && handleCellClick(day, hour)}
                >
                  {/* Render shifts that start at this hour/day */}
                  {(() => {
                    const shiftsInCell = filteredShifts.filter((shift) =>
                      shouldDisplayShift(day, hour, shift),
                    );

                    // If there are multiple shifts, show a summary instead of individual blocks
                    if (shiftsInCell.length > 1) {
                      const employeeNames = shiftsInCell.map(
                        (s) => s.employeeName || "Unknown",
                      );
                      const firstShift = shiftsInCell[0];

                      // Group shifts by type to show mixed colors if needed
                      const shiftTypes = [
                        ...new Set(shiftsInCell.map((s) => s.shiftType)),
                      ];
                      const multipleTypes = shiftTypes.length > 1;

                      // Calculate total hours for this cell
                      const totalHours = shiftsInCell.reduce((sum, shift) => {
                        const startHour = parseInt(
                          shift.startTime.split(":")[0],
                        );
                        const endHour = parseInt(shift.endTime.split(":")[0]);
                        const hours =
                          endHour > startHour
                            ? endHour - startHour
                            : 24 - startHour + endHour;
                        return sum + hours;
                      }, 0);

                      return (
                        <div
                          className="relative w-full h-full flex flex-col justify-between p-2 rounded-md cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                          style={{
                            background: multipleTypes
                              ? "linear-gradient(135deg, #3b82f6 0%, #22c55e 50%, #f97316 100%)"
                              : firstShift.shiftType === "morning"
                                ? "#3b82f6"
                                : firstShift.shiftType === "evening"
                                  ? "#22c55e"
                                  : "#f97316",
                            minHeight: "70px",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShiftClick(firstShift);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-white text-xs font-medium bg-black/20 px-1.5 py-0.5 rounded">
                              {firstShift.startTime}-{firstShift.endTime}
                            </div>
                            <div className="text-white text-xs font-bold bg-black/20 px-1.5 py-0.5 rounded">
                              {totalHours}h
                            </div>
                          </div>
                          <div className="mt-2">
                            <AvatarGroup names={employeeNames} />
                          </div>
                        </div>
                      );
                    }

                    // Otherwise show individual shift blocks
                    return shiftsInCell.map((shift, index) => {
                      // Calculate offset for multiple shifts in the same cell
                      const offsetStyle =
                        index > 0
                          ? {
                              marginTop: `${index * 3}px`,
                              marginLeft: `${index * 3}px`,
                              zIndex: index + 1,
                            }
                          : { zIndex: 1 };
                      return (
                        <div
                          key={shift.id}
                          style={offsetStyle}
                          className="relative"
                        >
                          <ShiftBlock
                            {...shift}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShiftClick(shift);
                            }}
                          />
                        </div>
                      );
                    });
                  })()}

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
