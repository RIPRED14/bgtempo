import React from "react";
import { Sidebar } from "./Admin/Sidebar";
import { StatsCards } from "./Admin/StatsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  Users,
  Clock,
  FileText,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <Button
            onClick={() => navigate("/planning")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Aller au Planning
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Accès Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate("/planning")}
                >
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <span>Planning</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate("/employees")}
                >
                  <Users className="h-8 w-8 text-indigo-600" />
                  <span>Employés</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate("/absences")}
                >
                  <Clock className="h-8 w-8 text-red-600" />
                  <span>Absences</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate("/reports")}
                >
                  <FileText className="h-8 w-8 text-green-600" />
                  <span>Rapports</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Planning mis à jour</p>
                    <p className="text-sm text-slate-500">
                      Le planning de la semaine a été mis à jour il y a 2 heures
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Nouvel employé ajouté</p>
                    <p className="text-sm text-slate-500">
                      Sarah Johnson a été ajoutée à l'équipe hier
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Absence signalée</p>
                    <p className="text-sm text-slate-500">
                      Mike Williams sera absent le 15 mai
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => navigate("/employee/login")}
                >
                  <User className="h-4 w-4" />
                  Accéder à l'Espace Employé
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
