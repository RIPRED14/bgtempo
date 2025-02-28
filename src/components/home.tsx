import React, { useState, useEffect } from "react";
import PlanningLayout from "./ShiftManagement/PlanningLayout";
import Header from "./ShiftManagement/Header";
import FilterBar from "./ShiftManagement/FilterBar";
import WeeklyCalendar from "./ShiftManagement/WeeklyCalendar";
import EmployeeList from "./ShiftManagement/EmployeeList";
import ShiftSummary from "./ShiftManagement/ShiftSummary";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText } from "lucide-react";
import ShiftDialog from "./ShiftManagement/ShiftDialog";
import ShiftExportModal from "./ShiftManagement/ShiftExportModal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  Shift,
} from "@/lib/api";

interface ShiftData {
  id: string;
  employeeName: string;
  day: string;
  startTime: string;
  endTime: string;
  shiftType: "morning" | "evening" | "night";
}

const Home: React.FC = () => {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState("1 - 7 Mai, 2023");
  const [shifts, setShifts] = useState<Shift[]>([
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
    {
      id: "shift-6",
      employeeName: "John Smith",
      employeeId: "emp-1",
      day: "Thursday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
    {
      id: "shift-7",
      employeeName: "Sarah Johnson",
      employeeId: "emp-2",
      day: "Saturday",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
    },
    {
      id: "shift-8",
      employeeName: "Mike Williams",
      employeeId: "emp-3",
      day: "Sunday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
    {
      id: "shift-9",
      employeeName: "Lisa Brown",
      employeeId: "emp-4",
      day: "Thursday",
      startTime: "17:00",
      endTime: "00:00",
      shiftType: "evening",
    },
    {
      id: "shift-10",
      employeeName: "David Miller",
      employeeId: "emp-5",
      day: "Saturday",
      startTime: "11:00",
      endTime: "17:00",
      shiftType: "morning",
    },
  ]);

  const [filters, setFilters] = useState({
    employee: "all-employees",
    day: "all-days",
    shiftType: "all-shifts",
    searchTerm: "",
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState({
    totalShifts: 0,
    employeeHours: {} as Record<string, number>,
    shiftsByType: { morning: 0, evening: 0, night: 0 },
  });

  // Calculate summary data when shifts change
  useEffect(() => {
    const employeeHours: Record<string, number> = {};
    let morningShifts = 0;
    let eveningShifts = 0;
    let nightShifts = 0;

    shifts.forEach((shift) => {
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
      totalShifts: shifts.length,
      employeeHours,
      shiftsByType: {
        morning: morningShifts,
        evening: eveningShifts,
        night: nightShifts,
      },
    });
  }, [shifts]);

  const handlePreviousWeek = () => {
    // In a real app, this would calculate the previous week
    setCurrentWeek("24 - 30 Avril, 2023");
  };

  const handleNextWeek = () => {
    // In a real app, this would calculate the next week
    setCurrentWeek("8 - 14 Mai, 2023");
  };

  const handleTodayClick = () => {
    // In a real app, this would set the current week
    setCurrentWeek("1 - 7 Mai, 2023");
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const loadShifts = async () => {
      const shiftsData = await fetchShifts();
      if (shiftsData.length > 0) {
        setShifts(shiftsData);
      }
    };

    loadShifts();
  }, []);

  // Helper function to get French day name
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

  const handleShiftUpdate = async (updatedShift: Shift) => {
    // For demo purposes, directly update state without waiting for API
    setShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift,
      ),
    );

    // Show success toast
    toast({
      title: "Shift modifié",
      description: `Shift de ${updatedShift.employeeName} le ${getDayNameFr(updatedShift.day)} a été mis à jour`,
    });

    // In a real app with backend:
    // const result = await updateShift(updatedShift);
    // if (result) {
    //   setShifts((prevShifts) =>
    //     prevShifts.map((shift) => (shift.id === result.id ? result : shift)),
    //   );
    // }
  };

  const handleShiftCreate = async (newShift: Omit<Shift, "id">) => {
    // If the shift doesn't have an employeeId, we need to find it
    if (!newShift.employeeId && newShift.employeeName) {
      // In a real app, you would look up the employee ID from the name
      // For now, we'll use a simple mapping
      const employeeMap: Record<string, string> = {
        "John Smith": "emp-1",
        "Sarah Johnson": "emp-2",
        "Mike Williams": "emp-3",
        "Lisa Brown": "emp-4",
        "David Miller": "emp-5",
      };

      newShift = {
        ...newShift,
        employeeId: employeeMap[newShift.employeeName] || "emp-1", // Default to emp-1 if not found
      };
    } else if (!newShift.employeeId) {
      // Ensure employeeId is always set
      newShift = {
        ...newShift,
        employeeId: "emp-1",
      };
    }

    // For demo purposes, directly add to state without waiting for API
    const newId = `shift-${Date.now()}`;
    const result = {
      ...newShift,
      id: newId,
    } as Shift;

    // Find the employee name if it's not provided
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

    setShifts((prevShifts) => [...prevShifts, result]);

    // Show success toast
    toast({
      title: "Shift créé",
      description: `Shift ajouté pour ${result.employeeName} le ${getDayNameFr(result.day)} à ${result.startTime}`,
    });

    // In a real app with backend:
    // const result = await createShift(newShift);
    // if (result) {
    //   setShifts((prevShifts) => [...prevShifts, result]);
    // }
  };

  const handleShiftDelete = async (shiftId: string) => {
    // Find the shift to be deleted for the toast message
    const shiftToDelete = shifts.find((shift) => shift.id === shiftId);

    // For demo purposes, directly update state without waiting for API
    setShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.id !== shiftId),
    );

    // Show success toast
    if (shiftToDelete) {
      toast({
        title: "Shift supprimé",
        description: `Shift de ${shiftToDelete.employeeName} le ${getDayNameFr(shiftToDelete.day)} à ${shiftToDelete.startTime} a été supprimé`,
      });
    }

    // In a real app with backend:
    // const success = await deleteShift(shiftId);
    // if (success) {
    //   setShifts((prevShifts) =>
    //     prevShifts.filter((shift) => shift.id !== shiftId),
    //   );
    // }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    if (selectedEmployeeId === employeeId) {
      // If clicking the same employee, deselect
      setSelectedEmployeeId("");
      setFilters({ ...filters, employee: "all-employees" });
    } else {
      setSelectedEmployeeId(employeeId);
      // In a real app, you would map the employee ID to the employee name
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
    const shift = shifts.find((s) => s.id === shiftId);
    if (shift) {
      // In a real app, you would open the shift dialog with this shift data
      console.log("Clicked on shift:", shift);
    }
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  const exportSchedule = () => {
    setExportModalOpen(true);
  };

  const handleExport = (format: string, options: any) => {
    // In a real app, this would generate a PDF or Excel file based on format and options
    console.log("Exporting in format:", format, "with options:", options);

    toast({
      title: "Exportation réussie",
      description: `Le planning a été exporté au format ${format.toUpperCase()}.`,
    });
  };

  return (
    <PlanningLayout>
      <div className="flex flex-col h-screen">
        <Header
          currentWeek={currentWeek}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onTodayClick={handleTodayClick}
        />
        <div className="flex justify-between items-center px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-4">
            <FilterBar
              onFilterChange={handleFilterChange}
              className="border-none p-0"
            />
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                {summaryData.shiftsByType.morning} Matin
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-100"
              >
                {summaryData.shiftsByType.evening} Soir
              </Badge>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-600 hover:bg-orange-100"
              >
                {summaryData.shiftsByType.night} Nuit
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={toggleSummary}
            >
              <FileText className="h-4 w-4" />
              {showSummary ? "Masquer le résumé" : "Voir le résumé"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportSchedule}
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
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
          />
          <div className="flex-1 overflow-auto p-4">
            {showSummary ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <WeeklyCalendar
                    shifts={shifts}
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
                <div>
                  <ShiftSummary
                    totalShifts={summaryData.totalShifts}
                    employeeHours={summaryData.employeeHours}
                    shiftsByType={summaryData.shiftsByType}
                    shifts={shifts}
                  />
                </div>
              </div>
            ) : (
              <WeeklyCalendar
                shifts={shifts}
                onShiftUpdate={handleShiftUpdate}
                onShiftCreate={handleShiftCreate}
                onShiftDelete={handleShiftDelete}
                filteredEmployee={filters.employee}
                filteredDay={filters.day}
                filteredShiftType={
                  filters.shiftType as "morning" | "evening" | "night"
                }
              />
            )}
          </div>
        </div>
      </div>

      <ShiftDialog
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSave={handleShiftCreate}
      />

      <ShiftExportModal
        isOpen={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
      />
      <Toaster />
    </PlanningLayout>
  );
};

export default Home;
