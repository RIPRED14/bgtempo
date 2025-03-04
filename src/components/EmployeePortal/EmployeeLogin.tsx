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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Récupérer les employés depuis le localStorage pour avoir les identifiants à jour
  const getEmployeeCredentials = () => {
    try {
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        const employees = JSON.parse(savedEmployees);
        if (Array.isArray(employees)) {
          const credentials: Record<string, any> = {};
          employees.forEach((employee) => {
            if (employee.username && employee.code) {
              credentials[employee.username] = {
                password: employee.code,
                id: employee.id,
                name: employee.name,
                canEdit: false,
              };
            }
          });
          return credentials;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des identifiants:", error);
    }

    // Fallback aux identifiants par défaut
    return {
      john: {
        password: "1234",
        id: "emp-1",
        name: "John Smith",
        canEdit: false,
      },
      sarah: {
        password: "2345",
        id: "emp-2",
        name: "Sarah Johnson",
        canEdit: false,
      },
      mike: {
        password: "3456",
        id: "emp-3",
        name: "Mike Williams",
        canEdit: false,
      },
      lisa: {
        password: "4567",
        id: "emp-4",
        name: "Lisa Brown",
        canEdit: false,
      },
      david: {
        password: "5678",
        id: "emp-5",
        name: "David Miller",
        canEdit: false,
      },
    };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Récupérer les identifiants à jour
    const employeeCredentials = getEmployeeCredentials();
    console.log("Identifiants disponibles:", Object.keys(employeeCredentials));

    // Simulate API call
    setTimeout(() => {
      // Check if employee exists and password matches
      if (
        username in employeeCredentials &&
        employeeCredentials[username].password === password
      ) {
        console.log("Connexion réussie pour:", username);
        // Store employee info in localStorage
        localStorage.setItem(
          "employeePortalUser",
          JSON.stringify({
            id: employeeCredentials[username].id,
            name: employeeCredentials[username].name,
            username: username,
            canEdit: employeeCredentials[username].canEdit,
          }),
        );

        // Redirect to employee dashboard
        navigate("/employee/dashboard");
      } else {
        console.log(
          "Échec de connexion pour:",
          username,
          "Mot de passe fourni:",
          password,
        );
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
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    placeholder="Votre nom d'utilisateur"
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Votre code à 4 chiffres"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={4}
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
