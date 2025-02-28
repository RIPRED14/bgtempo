import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const StatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Employés
              </p>
              <h3 className="text-3xl font-bold mt-1">12</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +2
            </span>
            <span className="text-slate-500 ml-2">depuis le mois dernier</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Shifts cette semaine
              </p>
              <h3 className="text-3xl font-bold mt-1">48</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +5
            </span>
            <span className="text-slate-500 ml-2">
              par rapport à la semaine dernière
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Absences signalées
              </p>
              <h3 className="text-3xl font-bold mt-1">3</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              +1
            </span>
            <span className="text-slate-500 ml-2">
              depuis la semaine dernière
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Heures Travaillées
              </p>
              <h3 className="text-3xl font-bold mt-1">125</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
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
                className="text-indigo-600"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              -3%
            </span>
            <span className="text-slate-500 ml-2">
              par rapport à la semaine dernière
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
