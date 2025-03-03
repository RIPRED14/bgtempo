import React from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

const EmployeeLayout: React.FC<EmployeeLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("employeePortalUser");
    navigate("/employee/login");
  };

  // Check if user is logged in
  React.useEffect(() => {
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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Espace Employé</h1>
              <p className="text-sm text-slate-500">Burger Staff Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-medium">{employeeInfo.name}</p>
              <p className="text-xs text-slate-500">ID: {employeeInfo.id}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-slate-200 py-4 px-6">
        <div className="container mx-auto text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Burger Staff Manager - Espace Employé
        </div>
      </footer>
    </div>
  );
};

export default EmployeeLayout;
