import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, Users } from "lucide-react";
import ShiftCalendarView from "./ShiftCalendarView";

interface ShiftSummaryProps {
  totalShifts: number;
  employeeHours: Record<string, number>;
  shiftsByType: Record<string, number>;
  shifts?: any[];
}

const ShiftSummary: React.FC<ShiftSummaryProps> = ({
  totalShifts = 0,
  employeeHours = {},
  shiftsByType = { morning: 0, evening: 0, night: 0 },
  shifts = [],
}) => {
  // Sort employees by hours (descending)
  const sortedEmployees = Object.entries(employeeHours).sort(
    ([, hoursA], [, hoursB]) => hoursB - hoursA,
  );

  return (
    <Card className="bg-white shadow-sm border-slate-200">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-bold flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          Résumé de la Semaine
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Shifts par période
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-blue-600">
                  {shiftsByType.morning}
                </div>
                <div className="text-xs text-slate-500">Matin (11h-17h)</div>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-green-600">
                  {shiftsByType.evening}
                </div>
                <div className="text-xs text-slate-500">Soir (17h-00h)</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-md">
                <div className="text-2xl font-bold text-orange-600">
                  {shiftsByType.night}
                </div>
                <div className="text-xs text-slate-500">Nuit (00h-7h)</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Aperçu de la semaine
            </h3>
            <ShiftCalendarView shifts={shifts} className="mb-4" />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Heures par employé
            </h3>
            <div className="space-y-3">
              {sortedEmployees.length > 0 ? (
                sortedEmployees.map(([employee, hours]) => (
                  <div key={employee} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">{employee}</div>
                      <div className="text-sm font-bold">{hours}h</div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (hours /
                              Math.max(...Object.values(employeeHours))) *
                              100,
                            100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400 italic">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftSummary;
