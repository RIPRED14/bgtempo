import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("employeePortalUser");
    if (!storedUser) {
      navigate("/employee/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("employeePortalUser");
    navigate("/employee/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-md">
              <User className="h-5 w-5" />
            </div>
            <h1 className="font-bold text-lg">Espace Employé</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Burger Staff Manager - Tous droits
          réservés
        </div>
      </footer>
    </div>
  );
};

export default EmployeeLayout;
