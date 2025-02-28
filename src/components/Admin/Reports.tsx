import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Admin/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Clock,
  FileText,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { fetchEmployees, fetchShifts, Employee, Shift } from "@/lib/api";

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState("weekly");
  const [period, setPeriod] = useState("current");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [employeesData, shiftsData] = await Promise.all([
        fetchEmployees(),
        fetchShifts(),
      ]);
      setEmployees(employeesData);
      setShifts(shiftsData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Calculate employee hours
  const employeeHours: Record<string, number> = {};
  const employeeShifts: Record<string, number> = {};

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
      employeeShifts[shift.employeeName] += 1;
    } else {
      employeeHours[shift.employeeName] = hours;
      employeeShifts[shift.employeeName] = 1;
    }
  });

  // Count shifts by day
  const shiftsByDay: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  shifts.forEach((shift) => {
    if (shiftsByDay[shift.day]) {
      shiftsByDay[shift.day] += 1;
    } else {
      shiftsByDay[shift.day] = 1;
    }
  });

  // Count shifts by type
  const shiftsByType: Record<string, number> = {
    morning: 0,
    evening: 0,
    night: 0,
  };

  shifts.forEach((shift) => {
    if (shiftsByType[shift.shiftType]) {
      shiftsByType[shift.shiftType] += 1;
    } else {
      shiftsByType[shift.shiftType] = 1;
    }
  });

  // Sort employees by hours
  const sortedEmployeesByHours = Object.entries(employeeHours)
    .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
    .slice(0, 5);

  // Get period label
  const getPeriodLabel = () => {
    switch (period) {
      case "current":
        return reportType === "weekly" ? "Semaine actuelle" : "Mois actuel";
      case "previous":
        return reportType === "weekly"
          ? "Semaine précédente"
          : "Mois précédent";
      case "next":
        return reportType === "weekly" ? "Semaine prochaine" : "Mois prochain";
      default:
        return "";
    }
  };

  const exportReport = () => {
    // In a real app, this would generate a PDF or Excel file
    alert("Exportation du rapport en cours...");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Rapports</h1>
            <p className="text-slate-500 mt-1">
              Analysez les données de votre restaurant
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Select
                value={reportType}
                onValueChange={setReportType}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type de rapport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={period}
                onValueChange={setPeriod}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    {reportType === "weekly" ? "Cette semaine" : "Ce mois"}
                  </SelectItem>
                  <SelectItem value="previous">
                    {reportType === "weekly"
                      ? "Semaine précédente"
                      : "Mois précédent"}
                  </SelectItem>
                  <SelectItem value="next">
                    {reportType === "weekly"
                      ? "Semaine prochaine"
                      : "Mois prochain"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="flex items-center gap-2"
              onClick={exportReport}
              disabled={isLoading}
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-slate-500">Chargement des données...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Employés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{employees.length}</div>
                  <p className="text-sm text-slate-500 mt-1">Employés actifs</p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Shifts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{shifts.length}</div>
                  <p className="text-sm text-slate-500 mt-1">
                    Shifts programmés
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                    Heures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Object.values(employeeHours).reduce(
                      (sum, hours) => sum + hours,
                      0,
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Heures totales</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Répartition des Shifts par Jour
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {Object.entries(shiftsByDay).map(([day, count]) => {
                      const maxCount = Math.max(...Object.values(shiftsByDay));
                      const percentage = (count / maxCount) * 100;

                      // Convert day to French
                      const dayMap: Record<string, string> = {
                        Monday: "Lundi",
                        Tuesday: "Mardi",
                        Wednesday: "Mercredi",
                        Thursday: "Jeudi",
                        Friday: "Vendredi",
                        Saturday: "Samedi",
                        Sunday: "Dimanche",
                      };

                      return (
                        <div key={day} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{dayMap[day]}</div>
                            <div className="text-sm font-bold">{count}</div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-slate-200">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    Répartition des Shifts par Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {shiftsByType.morning}
                      </div>
                      <div className="text-sm text-slate-500">
                        Matin (11h-17h)
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="text-2xl font-bold text-green-600">
                        {shiftsByType.evening}
                      </div>
                      <div className="text-sm text-slate-500">
                        Soir (17h-00h)
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-md">
                      <div className="text-2xl font-bold text-orange-600">
                        {shiftsByType.night}
                      </div>
                      <div className="text-sm text-slate-500">
                        Nuit (00h-7h)
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-600">
                          Répartition
                        </span>
                      </div>
                    </div>
                    <div className="flex h-4 overflow-hidden text-xs bg-slate-100 rounded-full">
                      <div
                        style={{
                          width: `${(shiftsByType.morning / shifts.length) * 100}%`,
                        }}
                        className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                      <div
                        style={{
                          width: `${(shiftsByType.evening / shifts.length) * 100}%`,
                        }}
                        className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                      ></div>
                      <div
                        style={{
                          width: `${(shiftsByType.night / shifts.length) * 100}%`,
                        }}
                        className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-sm border-slate-200 mb-8">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Users className="h-5 w-5 mr-2 text-indigo-600" />
                  Top 5 Employés par Heures Travaillées
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {sortedEmployeesByHours.map(([name, hours]) => (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-slate-500">
                            {employeeShifts[name] || 0} shifts
                          </div>
                        </div>
                        <div className="text-lg font-bold">{hours}h</div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${(hours / sortedEmployeesByHours[0][1]) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-slate-200">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-lg font-bold flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-slate-600" />
                  Résumé du Rapport
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <p className="text-slate-600">
                    <span className="font-bold">Période:</span>{" "}
                    {getPeriodLabel()}
                  </p>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold mb-2">Statistiques Générales</h3>
                      <ul className="space-y-1 text-slate-600">
                        <li>
                          • {employees.length} employés actifs dans le système
                        </li>
                        <li>• {shifts.length} shifts programmés au total</li>
                        <li>
                          •{" "}
                          {Object.values(employeeHours).reduce(
                            (sum, hours) => sum + hours,
                            0,
                          )}{" "}
                          heures de travail planifiées
                        </li>
                        <li>
                          • Moyenne de{" "}
                          {(shifts.length / employees.length).toFixed(1)} shifts
                          par employé
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">Répartition des Shifts</h3>
                      <ul className="space-y-1 text-slate-600">
                        <li>
                          • {shiftsByType.morning} shifts du matin (11h-17h)
                        </li>
                        <li>
                          • {shiftsByType.evening} shifts du soir (17h-00h)
                        </li>
                        <li>• {shiftsByType.night} shifts de nuit (00h-7h)</li>
                        <li>
                          • Jour le plus chargé:{" "}
                          {
                            Object.entries(shiftsByDay).reduce(
                              (max, [day, count]) =>
                                count > max[1] ? [day, count] : max,
                              ["", 0],
                            )[0]
                          }
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-bold mb-2">Recommandations</h3>
                    <ul className="space-y-1 text-slate-600">
                      <li>
                        • Considérer l'ajout de personnel supplémentaire pour
                        les shifts du{" "}
                        {
                          Object.entries(shiftsByDay).reduce(
                            (max, [day, count]) =>
                              count > max[1] ? [day, count] : max,
                            ["", 0],
                          )[0]
                        }
                      </li>
                      <li>
                        • Équilibrer la charge de travail entre les employés
                        pour éviter la surcharge
                      </li>
                      <li>
                        • Surveiller les heures supplémentaires pour les
                        employés travaillant plus de 35 heures par semaine
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
