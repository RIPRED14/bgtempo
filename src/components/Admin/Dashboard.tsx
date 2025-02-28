import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Admin/Sidebar";
import { StatsCards } from "@/components/Admin/StatsCards";
// DndProvider is now in App.tsx
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord</h1>
            <p className="text-slate-500 mt-1">
              Bienvenue sur l'interface d'administration de Burger Staff Manager
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cette Semaine
            </Button>
            <Button className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Générer Rapport
            </Button>
          </div>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card className="col-span-2 bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg font-bold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Aperçu des Shifts Hebdomadaires
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px] w-full">
                <div className="flex h-full">
                  <div className="w-12 flex flex-col justify-between text-xs text-slate-500 pr-2 py-2">
                    <div>20</div>
                    <div>15</div>
                    <div>10</div>
                    <div>5</div>
                    <div>0</div>
                  </div>
                  <div className="flex-1 flex items-end">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                      (day, i) => (
                        <div
                          key={day}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div className="w-full px-1">
                            <div className="relative w-full">
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-md"
                                style={{
                                  height: `${[60, 75, 45, 90, 100, 80, 30][i]}%`,
                                  opacity: 0.8,
                                }}
                              ></div>
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-md"
                                style={{
                                  height: `${[40, 55, 35, 70, 60, 50, 20][i]}%`,
                                  opacity: 0.8,
                                }}
                              ></div>
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-orange-500 rounded-t-md"
                                style={{
                                  height: `${[20, 30, 15, 40, 30, 30, 10][i]}%`,
                                  opacity: 0.8,
                                }}
                              ></div>
                              <div style={{ height: "200px" }}></div>
                            </div>
                          </div>
                          <div className="text-xs font-medium text-slate-600 mt-2">
                            {day}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4 gap-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-slate-600">
                    Matin (11h-17h)
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-slate-600">Soir (17h-00h)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm text-slate-600">Nuit (00h-7h)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg font-bold flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Top Employés
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  {
                    name: "John Smith",
                    position: "Chef",
                    hours: 38,
                    percent: 100,
                  },
                  {
                    name: "Sarah Johnson",
                    position: "Server",
                    hours: 32,
                    percent: 84,
                  },
                  {
                    name: "Mike Williams",
                    position: "Bartender",
                    hours: 30,
                    percent: 79,
                  },
                  {
                    name: "Lisa Brown",
                    position: "Server",
                    hours: 25,
                    percent: 66,
                  },
                ].map((employee) => (
                  <div key={employee.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-slate-500">
                          {employee.position} • {employee.hours}h
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${employee.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                Planning Hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 mb-4">
                Accédez au planning complet et gérez les shifts des employés.
              </p>
              <a
                href="/planning"
                className="text-blue-600 hover:underline font-medium flex items-center"
              >
                Voir le planning
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Liste des Employés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 mb-4">
                Consultez et gérez les informations de tous les employés.
              </p>
              <a
                href="/employees"
                className="text-indigo-600 hover:underline font-medium flex items-center"
              >
                Gérer les employés
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                Gestion des Absences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 mb-4">
                Suivez et gérez les absences signalées par les employés.
              </p>
              <a
                href="/absences"
                className="text-amber-600 hover:underline font-medium flex items-center"
              >
                Voir les absences
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
