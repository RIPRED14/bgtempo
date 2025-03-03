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

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Admin credentials
  const adminCredentials = {
    username: "admin",
    password: "0000",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check if admin credentials match
      if (
        username === adminCredentials.username &&
        password === adminCredentials.password
      ) {
        // Store admin info in localStorage
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            username: username,
            isAdmin: true,
          }),
        );

        // Redirect to admin dashboard
        navigate("/dashboard");
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
            <div className="bg-indigo-600 text-white p-3 rounded-full">
              <User className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Espace Administrateur
          </CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour gérer le planning et les employés
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
                    placeholder="admin"
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
                    type="password"
                    placeholder="••••"
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
          <Button variant="link" onClick={() => navigate("/employee/login")}>
            Accéder à l'espace employé
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
