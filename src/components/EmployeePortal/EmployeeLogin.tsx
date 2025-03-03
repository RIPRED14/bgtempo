import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeLogin: React.FC = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Mock employee credentials - these would be set by the admin in a real app
  const employeeCredentials = {
    "emp-1": { password: "password1", name: "John Smith", canEdit: false },
    "emp-2": { password: "password2", name: "Sarah Johnson", canEdit: false },
    "emp-3": { password: "password3", name: "Mike Williams", canEdit: false },
    "emp-4": { password: "password4", name: "Lisa Brown", canEdit: false },
    "emp-5": { password: "password5", name: "David Miller", canEdit: false },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check if employee exists and password matches
      if (
        employeeId in employeeCredentials &&
        employeeCredentials[employeeId as keyof typeof employeeCredentials]
          .password === password
      ) {
        // Store employee info in localStorage
        localStorage.setItem(
          "employeePortalUser",
          JSON.stringify({
            id: employeeId,
            name: employeeCredentials[
              employeeId as keyof typeof employeeCredentials
            ].name,
            canEdit:
              employeeCredentials[
                employeeId as keyof typeof employeeCredentials
              ].canEdit,
          }),
        );

        // Redirect to employee dashboard
        navigate("/employee/dashboard");
      } else {
        setError("Identifiant ou mot de passe incorrect");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <User className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Espace Employé
          </CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour voir votre planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Identifiant employé</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="employeeId"
                    placeholder="Votre identifiant (ex: emp-1)"
                    className="pl-9"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>
            <Button className="w-full mt-6" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/")}>
            Retour à l'accueil
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmployeeLogin;
