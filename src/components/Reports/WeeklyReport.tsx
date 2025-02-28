import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Admin/Sidebar";
import { getEmployeeStats, getWeekDates, getAdjacentWeek } from "@/lib/db";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  BarChart3,
} from "lucide-react";

function WeeklyReport() {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    employeeHours: {},
    shiftsByType: { morning: 0, evening: 0, night: 0 },
  });

  useEffect(() => {
    loadStats();
  }, [currentWeek]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployeeStats(currentWeek.start, currentWeek.end);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeekChange = (direction) => {
    setCurrentWeek(getAdjacentWeek(currentWeek.start, direction));
  };

  const handleTodayClick = () => {
    setCurrentWeek(getWeekDates());
  };

  const exportReport = () => {
    // In a real app, this would generate a PDF or Excel file
    alert("Exportation du rapport en cours...");
  };

  // Sort employees by hours (descending)
  const sortedEmployees = Object.entries(stats.employeeHours).sort(
    ([, hoursA], [, hoursB]) => hoursB - hoursA,
  );

  // Calculate total hours
  const totalHours = Object.values(stats.employeeHours).reduce(
    (sum, hours) => sum + hours,
    0,
  );

  // Calculate total shifts
  const totalShifts = Object.values(stats.shiftsByType).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Rapport Hebdomadaire</h1>
            <p className="text-slate-500 mt-1">
              Analyse des shifts et des heures travaillées
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleWeekChange("prev")}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="px-3 font-medium">
                {currentWeek.formattedRange}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleWeekChange("next")}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="flex items-center"
              disabled={isLoading}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Cette semaine
            </Button>

            <Button onClick={exportReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total des Shifts
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{totalShifts}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-500">
                  Semaine du {currentWeek.formattedRange}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Heures Travaillées
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{totalHours}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-500">
                  Moyenne de{" "}
                  {(totalHours / (sortedEmployees.length || 1)).toFixed(1)}h par
                  employé
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Employés Actifs
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {sortedEmployees.length}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-500">
                  {sortedEmployees.length > 0
                    ? `${sortedEmployees[0][0]} a travaillé le plus (${sortedEmployees[0][1]}h)`
                    : "Aucun employé actif"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2 bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg font-bold flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Répartition des Heures par Employé
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {sortedEmployees.length > 0 ? (
                  sortedEmployees.map(([employee, hours]) => (
                    <div key={employee} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{employee}</div>
                        <div className="text-sm font-bold">{hours}h</div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (hours /
                                Math.max(
                                  ...Object.values(stats.employeeHours),
                                )) *
                                100,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Aucune donnée disponible pour cette période
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg font-bold flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
                Répartition des Shifts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.shiftsByType.morning}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Matin (11h-17h)
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${totalShifts ? (stats.shiftsByType.morning / totalShifts) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.shiftsByType.evening}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Soir (17h-00h)
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{
                          width: `${totalShifts ? (stats.shiftsByType.evening / totalShifts) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-md">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.shiftsByType.night}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      Nuit (00h-7h)
                    </div>
                    <div className="w-full bg-orange-100 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full"
                        style={{
                          width: `${totalShifts ? (stats.shiftsByType.night / totalShifts) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-slate-500 mb-3">
                    Répartition globale
                  </h4>
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${totalShifts ? (stats.shiftsByType.morning / totalShifts) * 100 : 0}%`,
                      }}
                    ></div>
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${totalShifts ? (stats.shiftsByType.evening / totalShifts) * 100 : 0}%`,
                      }}
                    ></div>
                    <div
                      className="bg-orange-500"
                      style={{
                        width: `${totalShifts ? (stats.shiftsByType.night / totalShifts) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Missing components
const Clock = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const Users = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const PieChart = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
  </svg>
);

export default WeeklyReport;
