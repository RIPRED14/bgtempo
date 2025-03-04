import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Download,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { Shift } from "@/lib/api";
import { WeekStorage } from "@/lib/week-storage";
import EmployeeLayout from "./EmployeeLayout";

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState<{
    id: string;
    name: string;
    username: string;
    canEdit: boolean;
  } | null>(null);
  const [currentWeek, setCurrentWeek] = useState<{
    start: string;
    end: string;
    formattedRange: string;
  }>({ start: "", end: "", formattedRange: "" });
  const [employeeShifts, setEmployeeShifts] = useState<Shift[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get current week dates
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

  // Calculate shift duration in hours
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

  // Get shift type in French
  const getShiftTypeFr = (type: string): string => {
    const typeMap: Record<string, string> = {
      morning: "Matin",
      evening: "Soir",
      night: "Nuit",
    };
    return typeMap[type] || type;
  };

  // Load employee shifts for the current week
  const loadEmployeeShifts = () => {
    setIsLoading(true);

    // Get current week
    const week = getWeekDates();
    setCurrentWeek(week);

    // Try to load shifts from localStorage
    const weekKey = `shifts_${week.start}_${week.end}`;
    const savedShifts = localStorage.getItem(weekKey);

    if (savedShifts && employeeInfo) {
      try {
        const allShifts = JSON.parse(savedShifts) as Shift[];

        // Filter shifts for the current employee
        const filteredShifts = allShifts.filter(
          (shift) => shift.employeeId === employeeInfo.id,
        );

        setEmployeeShifts(filteredShifts);

        // Calculate total hours
        let hours = 0;
        filteredShifts.forEach((shift) => {
          hours += calculateShiftDuration(shift.startTime, shift.endTime);
        });

        setTotalHours(hours);
      } catch (error) {
        console.error("Error parsing shifts:", error);
        setEmployeeShifts([]);
        setTotalHours(0);
      }
    } else {
      setEmployeeShifts([]);
      setTotalHours(0);
    }

    setIsLoading(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("employeePortalUser");
    navigate("/employee/login");
  };

  // Export personal schedule
  const exportPersonalSchedule = async () => {
    try {
      // Show loading notification
      if (window.showNotification) {
        window.showNotification({
          title: "Préparation de l'exportation",
          description: "Génération de votre planning personnel...",
          variant: "info",
          position: "bottom-right",
          autoClose: false,
        });
      }

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add header
      csvContent += "Planning Personnel - Burger Staff Manager\n";
      csvContent += `Employé: ${employeeInfo?.name}\n`;
      csvContent += `Semaine du ${currentWeek.formattedRange}\n\n`;

      // Add shifts table
      csvContent += "Jour,Début,Fin,Durée,Type\n";

      // Sort shifts by day
      const sortedShifts = [...employeeShifts].sort((a, b) => {
        const dayOrder = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      });

      sortedShifts.forEach((shift) => {
        const duration = calculateShiftDuration(shift.startTime, shift.endTime);
        csvContent += `${getDayNameFr(shift.day)},${shift.startTime},${shift.endTime},${duration}h,${getShiftTypeFr(shift.shiftType)}\n`;
      });

      // Add summary
      csvContent += `\nTotal des heures: ${totalHours}h\n`;

      // Encode the CSV content
      const encodedUri = encodeURI(csvContent);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const currentDate = new Date().toISOString().split("T")[0];
      link.setAttribute(
        "download",
        `planning-personnel-${employeeInfo?.name.replace(/ /g, "-").toLowerCase()}-${currentDate}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      if (window.showNotification) {
        window.showNotification({
          title: "Exportation réussie",
          description: "Votre planning personnel a été téléchargé avec succès.",
          variant: "success",
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error exporting personal schedule:", error);

      // Show error notification
      if (window.showNotification) {
        window.showNotification({
          title: "Erreur d'exportation",
          description:
            "Une erreur est survenue lors de l'exportation de votre planning.",
          variant: "error",
          position: "bottom-right",
        });
      }
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("employeePortalUser");
    if (!storedUser) {
      navigate("/employee/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setEmployeeInfo(parsedUser);
    } catch (error) {
      console.error("Error parsing user info:", error);
      navigate("/employee/login");
    }
  }, [navigate]);

  // Load shifts when employee info is available
  useEffect(() => {
    if (employeeInfo) {
      loadEmployeeShifts();
    }
  }, [employeeInfo]);

  if (!employeeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <EmployeeLayout>
      <main className="container mx-auto py-8 px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">
                  Mon Planning
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-600 border-blue-200"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {currentWeek.formattedRange}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={exportPersonalSchedule}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Exporter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : employeeShifts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-slate-500 pb-2">
                      <div>Jour</div>
                      <div>Horaire</div>
                      <div>Durée</div>
                      <div>Type</div>
                      <div></div>
                    </div>
                    <Separator />
                    {/* Sort shifts by day of week */}
                    {[...employeeShifts]
                      .sort((a, b) => {
                        const dayOrder = [
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ];
                        return (
                          dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
                        );
                      })
                      .map((shift, index) => {
                        const duration = calculateShiftDuration(
                          shift.startTime,
                          shift.endTime,
                        );
                        return (
                          <div
                            key={index}
                            className="grid grid-cols-5 gap-4 py-3 items-center border-b border-slate-100"
                          >
                            <div className="font-medium">
                              {getDayNameFr(shift.day)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-slate-400" />
                              {shift.startTime} - {shift.endTime}
                            </div>
                            <div>
                              <Badge variant="outline" className="bg-slate-50">
                                {duration}h
                              </Badge>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className={`
                                  ${shift.shiftType === "morning" ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                                  ${shift.shiftType === "evening" ? "bg-green-50 text-green-600 border-green-200" : ""}
                                  ${shift.shiftType === "night" ? "bg-orange-50 text-orange-600 border-orange-200" : ""}
                                `}
                              >
                                {getShiftTypeFr(shift.shiftType)}
                              </Badge>
                            </div>
                            <div></div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">
                      Aucun shift prévu cette semaine
                    </p>
                    <p className="text-sm mt-2">
                      Vous n'avez pas de shifts programmés pour la semaine en
                      cours.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Mon Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">{employeeInfo.name}</h3>
                  <p className="text-slate-500 text-sm">
                    Utilisateur: {employeeInfo.username}
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">
                      Heures cette semaine
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{totalHours}h</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-600"
                      >
                        {employeeShifts.length} shifts
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">
                      Répartition
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 p-2 rounded-md text-center">
                        <span className="text-xs text-blue-600 font-medium">
                          Matin
                        </span>
                        <p className="text-lg font-bold text-blue-700">
                          {
                            employeeShifts.filter(
                              (s) => s.shiftType === "morning",
                            ).length
                          }
                        </p>
                      </div>
                      <div className="bg-green-50 p-2 rounded-md text-center">
                        <span className="text-xs text-green-600 font-medium">
                          Soir
                        </span>
                        <p className="text-lg font-bold text-green-700">
                          {
                            employeeShifts.filter(
                              (s) => s.shiftType === "evening",
                            ).length
                          }
                        </p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded-md text-center">
                        <span className="text-xs text-orange-600 font-medium">
                          Nuit
                        </span>
                        <p className="text-lg font-bold text-orange-700">
                          {
                            employeeShifts.filter(
                              (s) => s.shiftType === "night",
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/employee/settings")}
                      className="w-full flex items-center justify-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <User className="h-4 w-4" />
                      Paramètres du compte
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/employee/history")}
                      className="w-full flex items-center justify-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Calendar className="h-4 w-4" />
                      Historique des shifts
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/employee/absence")}
                      className="w-full flex items-center justify-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Demander une absence
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
