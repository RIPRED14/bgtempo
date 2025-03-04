import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, User, Lock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import EmployeeLayout from "./EmployeeLayout";

const EmployeeSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeInfo, setEmployeeInfo] = useState<{
    id: string;
    name: string;
    username: string;
  } | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSaveSettings = () => {
    // Reset error
    setError("");

    // Validate inputs
    if (!currentCode) {
      setError("Veuillez entrer votre code actuel");
      return;
    }

    if (!newCode) {
      setError("Veuillez entrer un nouveau code");
      return;
    }

    if (newCode !== confirmCode) {
      setError("Les nouveaux codes ne correspondent pas");
      return;
    }

    if (newCode.length !== 4 || !/^\d+$/.test(newCode)) {
      setError("Le code doit contenir exactement 4 chiffres");
      return;
    }

    setIsLoading(true);

    // Simulate API call to verify current code and update to new code
    setTimeout(() => {
      try {
        // Get employees from localStorage
        const savedEmployees = localStorage.getItem("employees");
        if (savedEmployees) {
          const employees = JSON.parse(savedEmployees);
          if (Array.isArray(employees)) {
            // Find the employee
            const employeeIndex = employees.findIndex(
              (e) => e.id === employeeInfo.id,
            );
            if (employeeIndex !== -1) {
              const employee = employees[employeeIndex];

              // Verify current code
              if (employee.code !== currentCode) {
                setError("Le code actuel est incorrect");
                setIsLoading(false);
                return;
              }

              // Update code
              employees[employeeIndex] = {
                ...employee,
                code: newCode,
              };

              // Save back to localStorage
              localStorage.setItem("employees", JSON.stringify(employees));

              // Show success message
              toast({
                title: "Code mis à jour",
                description: "Votre code d'accès a été modifié avec succès.",
                variant: "success",
              });

              // Clear form
              setCurrentCode("");
              setNewCode("");
              setConfirmCode("");
            } else {
              setError("Employé non trouvé");
            }
          }
        } else {
          setError("Impossible de récupérer les données des employés");
        }
      } catch (error) {
        console.error("Error updating code:", error);
        setError("Une erreur est survenue lors de la mise à jour du code");
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

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
            <User className="h-6 w-6 mr-2 text-blue-600" />
            Paramètres du compte
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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={employeeInfo.name}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <Input
                    value={employeeInfo.username}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div className="text-sm text-slate-500 italic">
                  Pour modifier vos informations personnelles, veuillez
                  contacter votre administrateur.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changer votre code d'accès</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="currentCode">Code actuel</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="currentCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Votre code actuel"
                      className="pl-9"
                      value={currentCode}
                      onChange={(e) => setCurrentCode(e.target.value)}
                      maxLength={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="newCode">Nouveau code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="newCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Nouveau code à 4 chiffres"
                      className="pl-9"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      maxLength={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmCode">Confirmer le nouveau code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Confirmer le nouveau code"
                      className="pl-9"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      maxLength={4}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeSettings;
