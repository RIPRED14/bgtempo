import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PlanningLayout from "./ShiftManagement/PlanningLayout";
import Header from "./ShiftManagement/Header";
import FilterBar from "./ShiftManagement/FilterBar";
import WeeklyCalendar from "./ShiftManagement/WeeklyCalendar";
import EmployeeList from "./ShiftManagement/EmployeeList";
import ShiftSummary from "./ShiftManagement/ShiftSummary";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  Edit,
  Calendar,
} from "lucide-react";
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
import WeekManager from "./ShiftManagement/WeekManager";
import { WeekStorage } from "@/lib/week-storage";

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
  const navigate = useNavigate();
  const location = useLocation();
  console.log("Home component rendering, current location:", location.pathname);
  const sharedShifts = location.state?.shifts || [];

  const [currentWeek, setCurrentWeek] = useState("1 - 7 Mai, 2023");
  const [weekDates, setWeekDates] = useState({
    start: "2023-05-01",
    end: "2023-05-07",
    formattedRange: "1 - 7 Mai, 2023",
  });
  const [shifts, setShifts] = useState<Shift[]>(
    sharedShifts.length > 0
      ? sharedShifts
      : [
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
        ],
  );

  const [filters, setFilters] = useState({
    employee: "all-employees",
    day: "all-days",
    shiftType: "all-shifts",
    searchTerm: "",
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [summaryData, setSummaryData] = useState({
    totalShifts: 0,
    employeeHours: {} as Record<string, number>,
    shiftsByType: { morning: 0, evening: 0, night: 0 },
  });

  // Function to load shifts for a specific week
  const loadShiftsForWeek = async (startDate: string, endDate: string) => {
    setIsLoading(true);
    try {
      // Try to load directly from localStorage first
      const weekKey = `shifts_${startDate}_${endDate}`;
      const savedShifts = localStorage.getItem(weekKey);

      if (savedShifts) {
        const parsedShifts = JSON.parse(savedShifts);
        if (Array.isArray(parsedShifts)) {
          console.log(
            `Loaded ${parsedShifts.length} shifts directly from localStorage for week ${startDate} to ${endDate}`,
          );
          setShifts(parsedShifts);

          // Calculate statistics
          const employeeHours: Record<string, number> = {};
          let morningShifts = 0;
          let eveningShifts = 0;
          let nightShifts = 0;

          parsedShifts.forEach((shift) => {
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
            totalShifts: parsedShifts.length,
            employeeHours,
            shiftsByType: {
              morning: morningShifts,
              evening: eveningShifts,
              night: nightShifts,
            },
          });

          // Show notification
          if (window.showNotification && parsedShifts.length > 0) {
            window.showNotification({
              title: "Semaine chargée",
              description: `${parsedShifts.length} shifts chargés pour la semaine du ${formatDateRange(new Date(startDate), new Date(endDate))}`,
              variant: "success",
              position: "bottom-right",
            });
          }

          setIsLoading(false);
          return;
        }
      }

      // If not found in localStorage, try database service as fallback
      const { DatabaseService } = await import("../lib/db-service");
      const shiftsData = await DatabaseService.getShifts(startDate, endDate);

      if (shiftsData.length > 0) {
        setShifts(shiftsData);

        // Show notification using the notification service if available
        if (window.showNotification) {
          window.showNotification({
            title: "Données chargées",
            description: `${shiftsData.length} shifts chargés pour la semaine du ${formatDateRange(new Date(startDate), new Date(endDate))}`,
            variant: "success",
            position: "bottom-right",
          });
        } else {
          toast({
            title: "Données chargées",
            description: `${shiftsData.length} shifts chargés depuis la base de données`,
          });
        }

        // Also load statistics
        const stats = await DatabaseService.getEmployeeStats(
          startDate,
          endDate,
        );
        setSummaryData({
          totalShifts: shiftsData.length,
          employeeHours: stats.employeeHours,
          shiftsByType: stats.shiftsByType,
        });
      } else {
        // If no shifts found, set empty array and show a message
        setShifts([]);
        setSummaryData({
          totalShifts: 0,
          employeeHours: {},
          shiftsByType: { morning: 0, evening: 0, night: 0 },
        });

        if (window.showNotification) {
          window.showNotification({
            title: "Nouvelle semaine",
            description: `Aucun shift trouvé pour la semaine du ${formatDateRange(new Date(startDate), new Date(endDate))}. Vous pouvez commencer à créer votre planning.`,
            variant: "info",
            position: "bottom-right",
          });
        }
      }
    } catch (error) {
      console.error("Error loading shifts:", error);
      // Set empty shifts on error
      setShifts([]);
      setSummaryData({
        totalShifts: 0,
        employeeHours: {},
        shiftsByType: { morning: 0, evening: 0, night: 0 },
      });

      toast({
        title: "Erreur de chargement",
        description:
          "Impossible de charger les shifts. Une nouvelle semaine vide a été créée.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date range for display
  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
    };
    const startStr = start.toLocaleDateString("fr-FR", options);
    const endStr = end.toLocaleDateString("fr-FR", options);
    const year = end.getFullYear();

    return `${startStr} - ${endStr}, ${year}`;
  };

  // Get week dates helper function
  const getWeekDates = (date = new Date()) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
      formattedRange: formatDateRange(monday, sunday),
    };
  };

  // Get adjacent week helper function
  const getAdjacentWeek = (
    currentStart: string,
    direction: "next" | "prev",
  ) => {
    const startDate = new Date(currentStart);
    const daysToAdd = direction === "next" ? 7 : -7;
    startDate.setDate(startDate.getDate() + daysToAdd);

    return getWeekDates(startDate);
  };

  const handlePreviousWeek = () => {
    // Calculate the previous week dates
    const prevWeek = getAdjacentWeek(weekDates.start, "prev");
    setWeekDates(prevWeek);
    setCurrentWeek(prevWeek.formattedRange);

    // Create the week in storage if it doesn't exist
    const weekKey = `shifts_${prevWeek.start}_${prevWeek.end}`;
    if (!localStorage.getItem(weekKey)) {
      localStorage.setItem(weekKey, JSON.stringify([]));
      // Also add to stored weeks list
      WeekStorage.saveShiftsForWeek(prevWeek.start, prevWeek.end, []);
    }

    // Load shifts for the previous week
    loadShiftsForWeek(prevWeek.start, prevWeek.end);
  };

  const handleNextWeek = () => {
    // Calculate the next week dates
    const nextWeek = getAdjacentWeek(weekDates.start, "next");
    setWeekDates(nextWeek);
    setCurrentWeek(nextWeek.formattedRange);

    // Create the week in storage if it doesn't exist
    const weekKey = `shifts_${nextWeek.start}_${nextWeek.end}`;
    if (!localStorage.getItem(weekKey)) {
      localStorage.setItem(weekKey, JSON.stringify([]));
      // Also add to stored weeks list
      WeekStorage.saveShiftsForWeek(nextWeek.start, nextWeek.end, []);
    }

    // Load shifts for the next week
    loadShiftsForWeek(nextWeek.start, nextWeek.end);
  };

  const handleTodayClick = () => {
    // Calculate the current week dates
    const currentWeek = getWeekDates();
    setWeekDates(currentWeek);
    setCurrentWeek(currentWeek.formattedRange);

    // Create the week in storage if it doesn't exist
    const weekKey = `shifts_${currentWeek.start}_${currentWeek.end}`;
    if (!localStorage.getItem(weekKey)) {
      localStorage.setItem(weekKey, JSON.stringify([]));
      // Also add to stored weeks list
      WeekStorage.saveShiftsForWeek(currentWeek.start, currentWeek.end, []);
    }

    // Load shifts for the current week
    loadShiftsForWeek(currentWeek.start, currentWeek.end);
  };

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

  // Load shifts on initial render
  useEffect(() => {
    // Only load from API if we don't have shifts from creation mode
    if (sharedShifts.length === 0) {
      // Initialize with current week
      const currentWeek = getWeekDates();
      setWeekDates(currentWeek);
      setCurrentWeek(currentWeek.formattedRange);

      // Check if there are any stored weeks
      const storedWeeks = WeekStorage.getAllStoredWeeks();

      // Save current week to the list of available weeks
      const weekKey = `shifts_${currentWeek.start}_${currentWeek.end}`;
      if (!localStorage.getItem(weekKey)) {
        localStorage.setItem(weekKey, JSON.stringify([]));
        // Also add to stored weeks list
        WeekStorage.saveShiftsForWeek(currentWeek.start, currentWeek.end, []);
      }

      // Show notification about independent weeks
      if (window.showNotification) {
        window.showNotification({
          title: "Planning par semaine",
          description:
            "Chaque semaine a son propre planning indépendant. Vous pouvez naviguer entre les semaines avec les flèches et chaque modification sera enregistrée pour la semaine en cours uniquement.",
          variant: "info",
          position: "bottom-right",
          autoCloseDelay: 10000,
        });
      }

      // Load shifts for the current week
      loadShiftsForWeek(currentWeek.start, currentWeek.end);
    }
  }, []);

  // Save shifts to localStorage whenever they change or week changes
  useEffect(() => {
    try {
      // Save shifts for the current week using the WeekStorage service
      const weekKey = `shifts_${weekDates.start}_${weekDates.end}`;
      localStorage.setItem(weekKey, JSON.stringify(shifts));
      console.log(
        `Saved ${shifts.length} shifts for week ${weekDates.formattedRange} to localStorage with key ${weekKey}`,
      );

      // Show notification for first-time users
      if (localStorage.getItem("firstTimeSavingWeek") !== "true") {
        if (window.showNotification) {
          window.showNotification({
            title: "Planning sauvegardé",
            description:
              "Votre planning a été sauvegardé pour cette semaine. Chaque semaine a son propre planning indépendant.",
            variant: "success",
            position: "bottom-right",
            autoCloseDelay: 8000,
          });
          localStorage.setItem("firstTimeSavingWeek", "true");
        }
      }
    } catch (error) {
      console.error("Error saving shifts to localStorage:", error);
    }
  }, [shifts, weekDates]);

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
    // Create a copy of the current shifts to restore if needed
    const previousShifts = [...shifts];

    // Update local state first for immediate UI feedback
    setShifts((prevShifts) =>
      prevShifts.map((shift) =>
        shift.id === updatedShift.id ? updatedShift : shift,
      ),
    );

    // Update the database
    try {
      const { DatabaseService } = await import("../lib/db-service");
      const result = await DatabaseService.updateShift(updatedShift);

      if (!result) {
        throw new Error("Failed to update shift");
      }

      // Show success toast
      toast({
        title: "Shift modifié",
        description: `Shift de ${updatedShift.employeeName} le ${getDayNameFr(updatedShift.day)} a été mis à jour`,
      });

      // Update statistics after successful update
      const stats = await DatabaseService.getEmployeeStats(
        weekDates.start,
        weekDates.end,
      );
      setSummaryData({
        totalShifts: shifts.length,
        employeeHours: stats.employeeHours,
        shiftsByType: stats.shiftsByType,
      });
    } catch (error) {
      console.error("Error updating shift:", error);

      // Restore previous state on error
      setShifts(previousShifts);

      toast({
        title: "Erreur de mise à jour",
        description:
          "Impossible de mettre à jour le shift dans la base de données",
        variant: "destructive",
      });
    }
  };

  const handleShiftCreate = async (newShift: Omit<Shift, "id">) => {
    // Validate the shift data
    if (!newShift.day || !newShift.startTime || !newShift.endTime) {
      toast({
        title: "Données incomplètes",
        description: "Les informations du shift sont incomplètes",
        variant: "destructive",
      });
      return;
    }

    // Prepare the shift data
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
    } else if (!newShift.employeeId) {
      newShift = {
        ...newShift,
        employeeId: "emp-1",
      };
    }

    // Create a temporary ID for optimistic UI update
    const tempId = `shift-${Date.now()}`;
    const tempShift = {
      ...newShift,
      id: tempId,
    } as Shift;

    // Find the employee name if it's not provided
    if (!tempShift.employeeName && tempShift.employeeId) {
      const employeeMap: Record<string, string> = {
        "emp-1": "John Smith",
        "emp-2": "Sarah Johnson",
        "emp-3": "Mike Williams",
        "emp-4": "Lisa Brown",
        "emp-5": "David Miller",
      };
      tempShift.employeeName = employeeMap[tempShift.employeeId] || "Unknown";
    }

    // Update local state first for immediate UI feedback
    setShifts((prevShifts) => [...prevShifts, tempShift]);

    // Save to the database
    try {
      const { DatabaseService } = await import("../lib/db-service");
      const savedShift = await DatabaseService.createShift(newShift);

      if (!savedShift) {
        throw new Error("Failed to create shift");
      }

      // Replace the temporary shift with the saved one
      setShifts((prevShifts) =>
        prevShifts.map((shift) => (shift.id === tempId ? savedShift : shift)),
      );

      // Update statistics after successful creation
      const stats = await DatabaseService.getEmployeeStats(
        weekDates.start,
        weekDates.end,
      );
      setSummaryData({
        totalShifts: shifts.length + 1, // +1 because we just added a shift
        employeeHours: stats.employeeHours,
        shiftsByType: stats.shiftsByType,
      });

      // Show success toast
      toast({
        title: "Shift créé",
        description: `Shift ajouté pour ${savedShift.employeeName} le ${getDayNameFr(savedShift.day)} à ${savedShift.startTime}`,
      });
    } catch (error) {
      console.error("Error creating shift:", error);
      // Remove from local state if save failed
      setShifts((prevShifts) => prevShifts.filter((s) => s.id !== tempId));

      toast({
        title: "Erreur de création",
        description: "Impossible de créer le shift dans la base de données",
        variant: "destructive",
      });
    }
  };

  const handleShiftDelete = async (shiftId: string) => {
    // Find the shift to be deleted for the toast message
    const shiftToDelete = shifts.find((shift) => shift.id === shiftId);

    // Store a copy in case we need to restore it
    const deletedShift = shiftToDelete ? { ...shiftToDelete } : null;

    // Store the current shifts state for potential rollback
    const previousShifts = [...shifts];

    // Update local state first for immediate UI feedback
    setShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.id !== shiftId),
    );

    // Delete from the database
    try {
      const { DatabaseService } = await import("../lib/db-service");
      const success = await DatabaseService.deleteShift(shiftId);

      if (!success) {
        throw new Error("Failed to delete shift");
      }

      // Update statistics after successful deletion
      const stats = await DatabaseService.getEmployeeStats(
        weekDates.start,
        weekDates.end,
      );
      setSummaryData({
        totalShifts: shifts.length - 1, // -1 because we just removed a shift
        employeeHours: stats.employeeHours,
        shiftsByType: stats.shiftsByType,
      });

      // Show success toast
      if (shiftToDelete) {
        toast({
          title: "Shift supprimé",
          description: `Shift de ${shiftToDelete.employeeName} le ${getDayNameFr(shiftToDelete.day)} à ${shiftToDelete.startTime} a été supprimé`,
        });
      }
    } catch (error) {
      console.error("Error deleting shift:", error);

      // Restore the previous state on error
      setShifts(previousShifts);

      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le shift de la base de données",
        variant: "destructive",
      });
    }
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

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleShiftClick = (shiftId: string) => {
    // Find the shift in the shifts array
    const shift = shifts.find((s) => s.id === shiftId);
    if (shift) {
      // In a real app, you would open the shift dialog with this shift data
      console.log("Clicked on shift:", shift);
    }
  };

  const exportSchedule = () => {
    setExportModalOpen(true);
  };

  const handleExport = async (format: string, options: any) => {
    try {
      // Show loading notification
      let notificationId;
      if (window.showNotification) {
        notificationId = window.showNotification({
          title: "Préparation de l'exportation",
          description: `Génération du fichier ${format.toUpperCase()} en cours...`,
          variant: "info",
          position: "bottom-right",
          autoClose: false,
        });
      }

      // Import the export service dynamically to avoid loading it unnecessarily
      const { ExportService } = await import("./ShiftManagement/ExportService");

      // First, install jsPDF if needed for PDF export
      if (format === "pdf") {
        try {
          // Check if jsPDF is already available
          // @ts-ignore
          if (typeof jsPDF === "undefined") {
            // Load jsPDF and jspdf-autotable dynamically
            await import("jspdf");
            await import("jspdf-autotable");
          }
        } catch (e) {
          console.log("jsPDF not available, will use fallback export method");
        }
      }

      // Add current week information to the export
      const exportOptions = {
        ...options,
        weekInfo: {
          start: weekDates.start,
          end: weekDates.end,
          formattedRange: weekDates.formattedRange,
        },
      };

      let success = false;
      if (format === "pdf") {
        success = await ExportService.exportToPDF(shifts, exportOptions);
      } else if (format === "excel") {
        success = await ExportService.exportToExcel(shifts, exportOptions);
      }

      // Dismiss loading notification if it exists
      if (notificationId && window.dismissNotification) {
        window.dismissNotification(notificationId);
      }

      if (success) {
        toast({
          title: "Exportation réussie",
          description: `Le planning a été exporté au format ${format.toUpperCase()}.`,
        });
      } else {
        throw new Error(`Failed to export to ${format}`);
      }
    } catch (error) {
      console.error("Error exporting schedule:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Impossible d'exporter le planning",
        variant: "destructive",
      });
    }
  };

  return (
    <PlanningLayout>
      <div className="flex flex-col h-screen bg-slate-50">
        <Header
          currentWeek={currentWeek}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onTodayClick={handleTodayClick}
        />
        <div className="flex justify-between items-center px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-4">
            <FilterBar
              onFilterChange={(filters) => setFilters(filters)}
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
          <div className="flex gap-2 items-center relative">
            <WeekManager
              currentWeek={weekDates}
              onSelectWeek={(week) => {
                setWeekDates(week);
                setCurrentWeek(week.formattedRange);
                loadShiftsForWeek(week.start, week.end);
              }}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              onTodayClick={handleTodayClick}
              onCreateNewWeek={() => {
                // Create a new week (next week by default)
                const nextWeek = getAdjacentWeek(weekDates.start, "next");

                // Check if this week already exists
                const weekKey = `shifts_${nextWeek.start}_${nextWeek.end}`;
                const existingShifts = localStorage.getItem(weekKey);

                if (existingShifts) {
                  // If week exists, ask user if they want to overwrite
                  if (window.showNotification) {
                    window.showNotification({
                      title: "Semaine existante",
                      description: `La semaine du ${nextWeek.formattedRange} existe déjà. Vous pouvez la sélectionner dans le menu des semaines.`,
                      variant: "warning",
                      position: "bottom-right",
                    });
                  }
                  return;
                }

                // Create new empty week
                setWeekDates(nextWeek);
                setCurrentWeek(nextWeek.formattedRange);
                // Clear shifts for the new week
                setShifts([]);
                // Save empty shifts array to localStorage for this week
                localStorage.setItem(weekKey, JSON.stringify([]));

                // Show notification
                if (window.showNotification) {
                  window.showNotification({
                    title: "Nouvelle semaine créée",
                    description: `Vous pouvez maintenant préparer le planning pour la semaine du ${nextWeek.formattedRange}`,
                    variant: "success",
                    position: "bottom-right",
                  });
                }
              }}
              onCopyCurrentWeek={(targetWeek) => {
                // Copy current shifts to target week
                const targetWeekKey = `shifts_${targetWeek.start}_${targetWeek.end}`;
                localStorage.setItem(targetWeekKey, JSON.stringify(shifts));

                // Show notification
                if (window.showNotification) {
                  window.showNotification({
                    title: "Planning copié",
                    description: `Le planning actuel a été copié vers la semaine du ${targetWeek.formattedRange}`,
                    variant: "success",
                    position: "bottom-right",
                  });
                }
              }}
            />
            <Button
              variant="outline"
              className="flex items-center gap-2 hover:bg-slate-50"
              onClick={() => {
                console.log("Navigating to creation mode with shifts:", shifts);
                navigate("/creation", { state: { shifts } });
              }}
            >
              <Maximize2 className="h-4 w-4" />
              Mode Création
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant="outline"
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              onClick={exportSchedule}
            >
              <Download className="h-4 w-4" />
              Télécharger Planning
            </Button>
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
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
          <div className="flex-1 overflow-auto p-2">
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
