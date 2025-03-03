import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import WeeklyCalendar from "./WeeklyCalendar";
import EmployeeList from "./EmployeeList";
import ShiftDialog from "./ShiftDialog";
import { Shift } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const CreationMode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get shifts from location state or use default
  const sharedShifts = location.state?.shifts || [];
  console.log("CreationMode received shifts:", sharedShifts);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [filters, setFilters] = useState({
    employee: "all-employees",
    day: "all-days",
    shiftType: "all-shifts",
  });

  // Default shifts if none provided
  const defaultShifts = [
    {
      id: "shift-1",
      employeeName: "John Smith",
      employeeId: "emp-1",
      day: "Monday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
    {
      id: "shift-2",
      employeeName: "Sarah Johnson",
      employeeId: "emp-2",
      day: "Monday",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
    },
    {
      id: "shift-3",
      employeeName: "Mike Williams",
      employeeId: "emp-3",
      day: "Tuesday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
    {
      id: "shift-4",
      employeeName: "Lisa Brown",
      employeeId: "emp-4",
      day: "Friday",
      startTime: "00:00",
      endTime: "07:00",
      shiftType: "night",
    },
    {
      id: "shift-5",
      employeeName: "David Miller",
      employeeId: "emp-5",
      day: "Wednesday",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
    },
  ];

  const [localShifts, setLocalShifts] = useState<Shift[]>(
    sharedShifts.length > 0 ? sharedShifts : defaultShifts,
  );

  const [summaryData, setSummaryData] = useState({
    totalShifts: 0,
    employeeHours: {} as Record<string, number>,
    shiftsByType: { morning: 0, evening: 0, night: 0 },
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Calculate summary data when shifts change
  useEffect(() => {
    console.log("Calculating summary data for shifts:", localShifts);
    const employeeHours: Record<string, number> = {};
    let morningShifts = 0;
    let eveningShifts = 0;
    let nightShifts = 0;

    localShifts.forEach((shift) => {
      // Calculate hours for this shift
      const startHour = parseInt(shift.startTime.split(":")[0]);
      const endHour = parseInt(shift.endTime.split(":")[0]);
      let hours = 0;

      if (endHour > startHour) {
        hours = endHour - startHour;
      } else {
        // Handle overnight shifts
        hours = 24 - startHour + endHour;
      }

      // Add hours to employee total
      if (employeeHours[shift.employeeName]) {
        employeeHours[shift.employeeName] += hours;
      } else {
        employeeHours[shift.employeeName] = hours;
      }

      // Count shift types
      if (shift.shiftType === "morning") morningShifts++;
      if (shift.shiftType === "evening") eveningShifts++;
      if (shift.shiftType === "night") nightShifts++;
    });

    setSummaryData({
      totalShifts: localShifts.length,
      employeeHours,
      shiftsByType: {
        morning: morningShifts,
        evening: eveningShifts,
        night: nightShifts,
      },
    });
  }, [localShifts]);

  const handleEmployeeSelect = (employeeId: string) => {
    if (selectedEmployeeId === employeeId) {
      // If clicking the same employee, deselect
      setSelectedEmployeeId("");
      setFilters({ ...filters, employee: "all-employees" });
    } else {
      setSelectedEmployeeId(employeeId);
      // Map the employee ID to the employee name
      const employeeMap: Record<string, string> = {
        "emp-1": "John Smith",
        "emp-2": "Sarah Johnson",
        "emp-3": "Mike Williams",
        "emp-4": "Lisa Brown",
        "emp-5": "David Miller",
      };
      setFilters({ ...filters, employee: employeeMap[employeeId] || "" });
    }
  };

  const handleShiftClick = (shiftId: string) => {
    // Find the shift in the shifts array
    const shift = localShifts.find((s) => s.id === shiftId);
    if (shift) {
      console.log("Clicked on shift:", shift);
    }
  };

  const handleShiftUpdate = (updatedShift: Shift) => {
    console.log("Updating shift:", updatedShift);
    setLocalShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift,
      ),
    );

    // Get day name in French for better user feedback
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

    toast({
      title: "Shift modifié",
      description: `Shift de ${updatedShift.employeeName} le ${getDayNameFr(updatedShift.day)} a été mis à jour`,
    });
  };

  const handleShiftCreate = (newShift: Omit<Shift, "id">) => {
    console.log("Creating new shift:", newShift);
    // If the shift doesn't have an employeeId, find it
    if (!newShift.employeeId && newShift.employeeName) {
      const employeeMap: Record<string, string> = {
        "John Smith": "emp-1",
        "Sarah Johnson": "emp-2",
        "Mike Williams": "emp-3",
        "Lisa Brown": "emp-4",
        "David Miller": "emp-5",
      };

      newShift = {
        ...newShift,
        employeeId: employeeMap[newShift.employeeName] || "emp-1",
      };
    }

    const newId = `shift-${Date.now()}`;
    const result = {
      ...newShift,
      id: newId,
    } as Shift;

    if (!result.employeeName && result.employeeId) {
      const employeeMap: Record<string, string> = {
        "emp-1": "John Smith",
        "emp-2": "Sarah Johnson",
        "emp-3": "Mike Williams",
        "emp-4": "Lisa Brown",
        "emp-5": "David Miller",
      };
      result.employeeName = employeeMap[result.employeeId] || "Unknown";
    }

    setLocalShifts((prevShifts) => [...prevShifts, result]);

    // Get day name in French for better user feedback
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

    toast({
      title: "Shift créé",
      description: `Shift ajouté pour ${result.employeeName} le ${getDayNameFr(result.day)} à ${result.startTime}`,
    });
  };

  const handleShiftDelete = (shiftId: string) => {
    console.log("Deleting shift:", shiftId);
    const shiftToDelete = localShifts.find((shift) => shift.id === shiftId);

    setLocalShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.id !== shiftId),
    );

    if (shiftToDelete) {
      // Get day name in French for better user feedback
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

      toast({
        title: "Shift supprimé",
        description: `Shift de ${shiftToDelete.employeeName} le ${getDayNameFr(shiftToDelete.day)} à ${shiftToDelete.startTime} a été supprimé`,
      });
    }
  };

  // Calculate weekly hours for each employee
  const calculateEmployeeHours = (employeeId: string) => {
    return localShifts
      .filter((shift) => shift.employeeId === employeeId)
      .reduce((acc, shift) => {
        const startHour = parseInt(shift.startTime.split(":")[0]);
        const endHour = parseInt(shift.endTime.split(":")[0]);
        return (
          acc +
          (endHour > startHour ? endHour - startHour : 24 - startHour + endHour)
        );
      }, 0);
  };

  // Prepare employee data for EmployeeList
  const employees = [
    {
      id: "emp-1",
      name: "John Smith",
      position: "Chef",
      weeklyHours: calculateEmployeeHours("emp-1"),
      shifts: localShifts.filter((shift) => shift.employeeId === "emp-1"),
    },
    {
      id: "emp-2",
      name: "Sarah Johnson",
      position: "Serveuse",
      weeklyHours: calculateEmployeeHours("emp-2"),
      shifts: localShifts.filter((shift) => shift.employeeId === "emp-2"),
    },
    {
      id: "emp-3",
      name: "Mike Williams",
      position: "Barman",
      weeklyHours: calculateEmployeeHours("emp-3"),
      shifts: localShifts.filter((shift) => shift.employeeId === "emp-3"),
    },
    {
      id: "emp-4",
      name: "Lisa Brown",
      position: "Serveuse",
      weeklyHours: calculateEmployeeHours("emp-4"),
      shifts: localShifts.filter((shift) => shift.employeeId === "emp-4"),
    },
    {
      id: "emp-5",
      name: "David Miller",
      position: "Cuisinier",
      weeklyHours: calculateEmployeeHours("emp-5"),
      shifts: localShifts.filter((shift) => shift.employeeId === "emp-5"),
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() => {
            console.log("Returning to planning with shifts:", localShifts);
            navigate("/", { state: { shifts: localShifts } });
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au planning
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-600">
              {summaryData.shiftsByType.morning} Matin
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-600">
              {summaryData.shiftsByType.evening} Soir
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-600">
              {summaryData.shiftsByType.night} Nuit
            </Badge>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter un shift
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <EmployeeList
          onEmployeeSelect={handleEmployeeSelect}
          selectedEmployeeId={selectedEmployeeId}
          onShiftClick={handleShiftClick}
          employees={employees}
        />
        <div className="flex-1 overflow-auto p-2">
          <WeeklyCalendar
            shifts={localShifts}
            onShiftUpdate={handleShiftUpdate}
            onShiftCreate={handleShiftCreate}
            onShiftDelete={handleShiftDelete}
            filteredEmployee={filters.employee}
            filteredDay={filters.day}
            filteredShiftType={
              filters.shiftType as "morning" | "evening" | "night"
            }
          />
        </div>
      </div>

      <ShiftDialog
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSave={handleShiftCreate}
        onDelete={handleShiftDelete}
      />

      <Toaster />
    </div>
  );
};

export default CreationMode;
