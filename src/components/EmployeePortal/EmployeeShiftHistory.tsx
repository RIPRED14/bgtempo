import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shift } from "@/lib/api";
import { WeekStorage } from "@/lib/week-storage";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "./EmployeeLayout";

const EmployeeShiftHistory: React.FC = () => {
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState<{
    id: string;
    name: string;
    username: string;
  } | null>(null);
  const [shiftHistory, setShiftHistory] = useState<
    {
      week: string;
      shifts: Shift[];
      totalHours: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load employee shift history
  useEffect(() => {
    const loadShiftHistory = async () => {
      setIsLoading(true);

      try {
        // Get all stored weeks
        const storedWeeks = WeekStorage.getAllStoredWeeks();
        const history: {
          week: string;
          shifts: Shift[];
          totalHours: number;
        }[] = [];

        // Load shifts for each week
        for (const week of storedWeeks) {
          const shifts = WeekStorage.getShiftsForWeek(week.start, week.end);
          if (shifts) {
            // Filter shifts for this employee
            const employeeShifts = shifts.filter(
              (shift) => shift.employeeId === employeeInfo.id,
            );

            if (employeeShifts.length > 0) {
              // Calculate total hours
              let totalHours = 0;
              employeeShifts.forEach((shift) => {
                totalHours += calculateShiftDuration(
                  shift.startTime,
                  shift.endTime,
                );
              });

              history.push({
                week: week.formattedRange,
                shifts: employeeShifts,
                totalHours,
              });
            }
          }
        }

        setShiftHistory(history);
      } catch (error) {
        console.error("Error loading shift history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeInfo) {
      loadShiftHistory();
    }
  }, [employeeInfo?.id]);

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
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Historique des shifts
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/employee/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">
              Historique de {employeeInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : shiftHistory.length > 0 ? (
              <div className="space-y-8">
                {shiftHistory.map((weekData, weekIndex) => (
                  <div key={weekIndex} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Semaine du {weekData.week}
                      </h3>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-600"
                      >
                        {weekData.totalHours}h - {weekData.shifts.length} shifts
                      </Badge>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      {/* Sort shifts by day of week */}
                      {[...weekData.shifts]
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
                              className="grid grid-cols-4 gap-4 py-3 items-center border-b border-slate-100"
                            >
                              <div className="font-medium">
                                {getDayNameFr(shift.day)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-slate-400" />
                                {shift.startTime} - {shift.endTime}
                              </div>
                              <div>
                                <Badge
                                  variant="outline"
                                  className="bg-slate-50"
                                >
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
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">
                  Aucun historique de shifts disponible
                </p>
                <p className="text-sm mt-2">
                  Aucun shift n'a été trouvé dans l'historique pour cet employé.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeShiftHistory;
