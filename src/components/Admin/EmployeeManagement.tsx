import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  User,
  Phone,
  Calendar,
  Clock,
  Edit,
  Trash2,
  ArrowUpDown,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { DbSyncService } from "@/lib/db-sync";
import { MockDatabase } from "@/lib/mock-db";

interface Employee {
  id: string;
  name: string;
  phone: string;
  position: string;
  weeklyHours: number;
  shiftsCount: number;
  availability: {
    days: string[];
    preferredHours: string;
  };
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "emp-1",
      name: "John Smith",
      phone: "06 12 34 56 78",
      position: "Chef",
      weeklyHours: 38,
      shiftsCount: 5,
      availability: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        preferredHours: "Matin",
      },
    },
    {
      id: "emp-2",
      name: "Sarah Johnson",
      phone: "06 23 45 67 89",
      position: "Serveuse",
      weeklyHours: 25,
      shiftsCount: 3,
      availability: {
        days: ["Monday", "Wednesday", "Friday", "Saturday"],
        preferredHours: "Soir",
      },
    },
    {
      id: "emp-3",
      name: "Mike Williams",
      phone: "06 34 56 78 90",
      position: "Barman",
      weeklyHours: 30,
      shiftsCount: 4,
      availability: {
        days: ["Thursday", "Friday", "Saturday", "Sunday"],
        preferredHours: "Soir",
      },
    },
    {
      id: "emp-4",
      name: "Lisa Brown",
      phone: "06 45 67 89 01",
      position: "Serveuse",
      weeklyHours: 22,
      shiftsCount: 3,
      availability: {
        days: ["Tuesday", "Thursday", "Saturday", "Sunday"],
        preferredHours: "Matin",
      },
    },
    {
      id: "emp-5",
      name: "David Miller",
      phone: "06 56 78 90 12",
      position: "Cuisinier",
      weeklyHours: 35,
      shiftsCount: 5,
      availability: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        preferredHours: "Matin",
      },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Employee | "availability.days" | "availability.preferredHours";
    direction: "ascending" | "descending";
  }>({ key: "name", direction: "ascending" });
  const [filterConfig, setFilterConfig] = useState<{
    position: string;
    minHours: number;
    hasShifts: boolean;
  }>({ position: "all", minHours: 0, hasShifts: false });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter employees based on search term and filters
  const filteredEmployees = employees
    .filter((employee) => {
      // Search filter
      if (
        searchTerm &&
        !employee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Position filter
      if (
        filterConfig.position !== "all" &&
        employee.position !== filterConfig.position
      ) {
        return false;
      }

      // Hours filter
      if (employee.weeklyHours < filterConfig.minHours) {
        return false;
      }

      // Has shifts filter
      if (filterConfig.hasShifts && employee.shiftsCount === 0) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortConfig.key === "availability.days") {
        return sortConfig.direction === "ascending"
          ? a.availability.days.length - b.availability.days.length
          : b.availability.days.length - a.availability.days.length;
      } else if (sortConfig.key === "availability.preferredHours") {
        return sortConfig.direction === "ascending"
          ? a.availability.preferredHours.localeCompare(
              b.availability.preferredHours,
            )
          : b.availability.preferredHours.localeCompare(
              a.availability.preferredHours,
            );
      } else {
        const aValue = a[sortConfig.key as keyof Employee];
        const bValue = b[sortConfig.key as keyof Employee];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }
        return 0;
      }
    });

  const handleSort = (
    key: keyof Employee | "availability.days" | "availability.preferredHours",
  ) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  const handleAddEmployee = () => {
    setEditMode(false);
    setSelectedEmployee(null);
    setValidationError("");
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditMode(true);
    setSelectedEmployee(employee);
    setValidationError("");
    setDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedEmployee) {
      setIsDeleting(true);

      try {
        // Show deleting indicator using the notification service if available
        let notificationId;
        if (window.showNotification) {
          notificationId = window.showNotification({
            title: "Suppression en cours",
            description: "Suppression de l'employé en cours...",
            variant: "warning",
            position: "top-right",
            autoClose: false,
          });
        } else {
          // Fallback to the old method
          const deletingIndicator = document.createElement("div");
          deletingIndicator.className =
            "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
          deletingIndicator.innerHTML = `
            <div class="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
            <span>Suppression de l'employé en cours...</span>
          `;
          document.body.appendChild(deletingIndicator);
        }

        // Store employee name for the success message
        const employeeName = selectedEmployee.name;
        const employeeId = selectedEmployee.id;

        // First delete from mock database directly
        const deleteResult = MockDatabase.deleteEmployee(employeeId);
        if (!deleteResult) {
          throw new Error(`Échec de la suppression de l'employé ${employeeId}`);
        }

        // Update local state
        const updatedEmployees = employees.filter((e) => e.id !== employeeId);

        // Update state
        setEmployees(updatedEmployees);

        // Sync with database - update the employees list
        await DbSyncService.syncEmployees(updatedEmployees);

        // Close dialog
        setConfirmDeleteOpen(false);

        // Show success message using the notification service if available
        if (window.showNotification) {
          // Dismiss the loading notification if it exists
          if (notificationId && window.dismissNotification) {
            window.dismissNotification(notificationId);
          }

          window.showNotification({
            title: "Suppression réussie",
            description: `Employé ${employeeName} supprimé avec succès`,
            variant: "success",
            position: "top-right",
          });
        } else {
          // Fallback to the old method
          document.body.removeChild(deletingIndicator);
          const successToast = document.createElement("div");
          successToast.className =
            "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
          successToast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Employé ${employeeName} supprimé avec succès</span>
          `;
          document.body.appendChild(successToast);
          setTimeout(() => document.body.removeChild(successToast), 3000);
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        // Show error message using the notification service if available
        if (window.showNotification) {
          // Dismiss the loading notification if it exists
          if (notificationId && window.dismissNotification) {
            window.dismissNotification(notificationId);
          }

          window.showNotification({
            title: "Erreur",
            description: "Erreur lors de la suppression de l'employé",
            variant: "error",
            position: "top-right",
          });
        } else {
          // Fallback to the old method
          const errorToast = document.createElement("div");
          errorToast.className =
            "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
          errorToast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>Erreur lors de la suppression de l'employé</span>
          `;
          document.body.appendChild(errorToast);
          setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const saveEmployee = async (formData: any) => {
    // Validate form data
    if (!formData.name) {
      setValidationError("Le nom de l'employé est requis");
      return;
    }
    if (!formData.position) {
      setValidationError("Le poste de l'employé est requis");
      return;
    }

    setIsSaving(true);
    setValidationError("");

    try {
      // Show saving indicator using the notification service if available
      let notificationId;
      if (window.showNotification) {
        notificationId = window.showNotification({
          title: editMode ? "Mise à jour" : "Création",
          description: `${editMode ? "Mise à jour" : "Création"} de l'employé en cours...`,
          variant: "info",
          position: "top-right",
          autoClose: false,
        });
      } else {
        // Fallback to the old method
        const savingIndicator = document.createElement("div");
        savingIndicator.className =
          "fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
        savingIndicator.innerHTML = `
          <div class="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
          <span>${editMode ? "Mise à jour" : "Création"} de l'employé en cours...</span>
        `;
        document.body.appendChild(savingIndicator);
      }

      if (editMode && selectedEmployee) {
        // Update existing employee
        const updatedEmployee = {
          ...selectedEmployee,
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          availability: {
            days: formData.availableDays || [],
            preferredHours: formData.preferredHours || "Matin",
          },
        };

        // Update local state
        const updatedEmployees = employees.map((e) =>
          e.id === selectedEmployee.id ? updatedEmployee : e,
        );

        // Update state
        setEmployees(updatedEmployees);

        // Sync with database
        const syncSuccess = await DbSyncService.syncEmployees(updatedEmployees);
        if (syncSuccess) {
          // Also sync availability
          await DbSyncService.syncAvailability(
            updatedEmployee.id,
            formData.availableDays || [],
            formData.preferredHours || "Matin",
          );
        }

        // Show success message using the notification service if available
        if (window.showNotification) {
          // Dismiss the loading notification if it exists
          if (notificationId && window.dismissNotification) {
            window.dismissNotification(notificationId);
          }

          window.showNotification({
            title: "Mise à jour réussie",
            description: "Employé mis à jour avec succès",
            variant: "success",
            position: "top-right",
          });
        } else {
          // Fallback to the old method
          document.body.removeChild(savingIndicator);
          const successToast = document.createElement("div");
          successToast.className =
            "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
          successToast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Employé mis à jour avec succès</span>
          `;
          document.body.appendChild(successToast);
          setTimeout(() => document.body.removeChild(successToast), 3000);
        }
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: `emp-${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          weeklyHours: 0,
          shiftsCount: 0,
          availability: {
            days: formData.availableDays || [],
            preferredHours: formData.preferredHours || "Matin",
          },
        };

        // Update local state with the new employee
        const newEmployees = [...employees, newEmployee];

        // Update state
        setEmployees(newEmployees);

        // Sync with database
        const syncSuccess = await DbSyncService.syncEmployees(newEmployees);
        if (syncSuccess) {
          // Also sync availability
          await DbSyncService.syncAvailability(
            newEmployee.id,
            formData.availableDays || [],
            formData.preferredHours || "Matin",
          );
        }

        // Show success message using the notification service if available
        if (window.showNotification) {
          // Dismiss the loading notification if it exists
          if (notificationId && window.dismissNotification) {
            window.dismissNotification(notificationId);
          }

          window.showNotification({
            title: "Création réussie",
            description: "Employé créé avec succès",
            variant: "success",
            position: "top-right",
          });
        } else {
          // Fallback to the old method
          document.body.removeChild(savingIndicator);
          const successToast = document.createElement("div");
          successToast.className =
            "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center";
          successToast.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Employé créé avec succès</span>
          `;
          document.body.appendChild(successToast);
          setTimeout(() => document.body.removeChild(successToast), 3000);
        }
      }

      // Close dialog
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      setValidationError("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterConfig({ position: "all", minHours: 0, hasShifts: false });
  };

  // Get unique positions for filter
  const positions = [
    ...new Set(employees.map((employee) => employee.position)),
  ];

  // Store employees in localStorage to persist between page refreshes
  useEffect(() => {
    // Save to localStorage whenever employees change
    try {
      localStorage.setItem("employees", JSON.stringify(employees));
      console.log("Saved employees to localStorage", employees.length);
    } catch (error) {
      console.error("Error saving employees to localStorage:", error);
    }
  }, [employees]);

  // Load employees from localStorage on initial render
  useEffect(() => {
    try {
      // Try to load from backup first (more reliable)
      const backupEmployees = localStorage.getItem("employees_backup");
      if (backupEmployees) {
        const parsedEmployees = JSON.parse(backupEmployees);
        if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          console.log("Loaded employees from backup", parsedEmployees.length);
          setEmployees(parsedEmployees);

          // Initialize mock database with these employees
          MockDatabase.saveEmployees(parsedEmployees);
          return; // Skip loading from regular storage
        }
      }

      // Fall back to regular storage if backup not available
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        if (Array.isArray(parsedEmployees) && parsedEmployees.length > 0) {
          console.log(
            "Loaded employees from localStorage",
            parsedEmployees.length,
          );
          setEmployees(parsedEmployees);

          // Initialize mock database with these employees
          MockDatabase.saveEmployees(parsedEmployees);
        } else {
          console.log(
            "No valid employees found in localStorage, using defaults",
          );
          // Initialize mock database with default employees
          MockDatabase.saveEmployees(employees);
        }
      } else {
        console.log("No employees found in localStorage, using defaults");
        // Initialize mock database with default employees
        MockDatabase.saveEmployees(employees);
      }

      // Verify database tables and structure
      const verifyDatabase = async () => {
        try {
          // Now verify data integrity
          const integrityCheck = await DbSyncService.verifyDataIntegrity();
          if (!integrityCheck.status) {
            console.warn("Data integrity issues found:", integrityCheck.issues);
            if (integrityCheck.repaired.length > 0) {
              console.log("Repairs made:", integrityCheck.repaired);
            }
          }

          // Force sync employees to database
          const syncResult = await DbSyncService.syncEmployees(employees);
          console.log("Initial employee sync result:", syncResult);
        } catch (error) {
          console.error("Error verifying database:", error);
        }
      };

      verifyDatabase();
    } catch (error) {
      console.error("Error loading employees from localStorage:", error);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-auto">
        <Card className="border-none shadow-none rounded-none">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center">
                <User className="h-6 w-6 mr-2 text-indigo-600" />
                Gestion des Employés
              </CardTitle>
              <Button
                onClick={handleAddEmployee}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter un employé
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Search and filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <Select
                    value={filterConfig.position}
                    onValueChange={(value) =>
                      setFilterConfig({ ...filterConfig, position: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tous les postes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les postes</SelectItem>
                      {positions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(filterConfig.minHours)}
                    onValueChange={(value) =>
                      setFilterConfig({
                        ...filterConfig,
                        minHours: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Heures minimum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Toutes les heures</SelectItem>
                      <SelectItem value="10">10+ heures</SelectItem>
                      <SelectItem value="20">20+ heures</SelectItem>
                      <SelectItem value="30">30+ heures</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={filterConfig.hasShifts ? "default" : "outline"}
                    className="flex items-center gap-2"
                    onClick={() =>
                      setFilterConfig({
                        ...filterConfig,
                        hasShifts: !filterConfig.hasShifts,
                      })
                    }
                  >
                    <Calendar className="h-4 w-4" />
                    Avec shifts
                  </Button>

                  {(searchTerm ||
                    filterConfig.position !== "all" ||
                    filterConfig.minHours > 0 ||
                    filterConfig.hasShifts) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetFilters}
                      className="h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center text-sm text-slate-500">
                <Filter className="h-4 w-4 mr-2" />
                {filteredEmployees.length} employé
                {filteredEmployees.length !== 1 ? "s" : ""} trouvé
                {filteredEmployees.length !== 1 ? "s" : ""}
              </div>

              <Separator />

              {/* Employees table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Nom
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleSort("position")}
                      >
                        <div className="flex items-center">
                          Poste
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleSort("weeklyHours")}
                      >
                        <div className="flex items-center">
                          Heures
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleSort("shiftsCount")}
                      >
                        <div className="flex items-center">
                          Shifts
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleSort("availability.days")}
                      >
                        <div className="flex items-center">
                          Disponibilités
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">
                            {employee.name}
                          </TableCell>
                          <TableCell>{employee.phone}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-slate-50 text-slate-700"
                            >
                              {employee.position}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                employee.weeklyHours >= 30
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                employee.weeklyHours >= 30 ? "bg-green-500" : ""
                              }
                            >
                              {employee.weeklyHours}h
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                employee.shiftsCount > 0 ? "default" : "outline"
                              }
                              className={
                                employee.shiftsCount > 0
                                  ? "bg-blue-500"
                                  : "bg-slate-100 text-slate-500"
                              }
                            >
                              {employee.shiftsCount}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex flex-wrap gap-1">
                                {employee.availability.days.map(
                                  (day, index) => {
                                    // Convert to short French day names
                                    const dayMap: Record<string, string> = {
                                      Monday: "Lun",
                                      Tuesday: "Mar",
                                      Wednesday: "Mer",
                                      Thursday: "Jeu",
                                      Friday: "Ven",
                                      Saturday: "Sam",
                                      Sunday: "Dim",
                                    };
                                    return (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs bg-slate-50"
                                      >
                                        {dayMap[day] || day}
                                      </Badge>
                                    );
                                  },
                                )}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {employee.availability.preferredHours}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditEmployee(employee)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteEmployee(employee)}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-slate-500"
                        >
                          Aucun employé trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Modifier l'employé" : "Ajouter un employé"}
              </DialogTitle>
            </DialogHeader>

            {validationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start mb-4">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{validationError}</p>
              </div>
            )}

            <EmployeeForm
              employee={selectedEmployee}
              onSave={saveEmployee}
              onCancel={() => setDialogOpen(false)}
              isSaving={isSaving}
            />
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Êtes-vous sûr de vouloir supprimer l'employé{" "}
                <span className="font-bold">{selectedEmployee?.name}</span> ?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Cette action est irréversible et supprimera toutes les données
                associées à cet employé.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isDeleting}>
                  Annuler
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

interface EmployeeFormProps {
  employee: Employee | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    position: string;
    availableDays: string[];
    preferredHours: string;
  }>({
    name: employee?.name || "",
    phone: employee?.phone || "",
    position: employee?.position || "",
    availableDays: employee?.availability.days || [],
    preferredHours: employee?.availability.preferredHours || "Matin",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDayToggle = (day: string) => {
    const currentDays = [...formData.availableDays];
    if (currentDays.includes(day)) {
      handleChange(
        "availableDays",
        currentDays.filter((d) => d !== day),
      );
    } else {
      handleChange("availableDays", [...currentDays, day]);
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name.trim()) {
      alert("Le nom de l'employé est requis");
      return;
    }
    if (!formData.position) {
      alert("Le poste de l'employé est requis");
      return;
    }

    onSave(formData);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nom et prénom</label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Nom et prénom"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Numéro de téléphone</label>
        <Input
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="06 XX XX XX XX"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Poste</label>
        <Select
          value={formData.position}
          onValueChange={(value) => handleChange("position", value)}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un poste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Chef">Chef</SelectItem>
            <SelectItem value="Cuisinier">Cuisinier</SelectItem>
            <SelectItem value="Serveur">Serveur</SelectItem>
            <SelectItem value="Serveuse">Serveuse</SelectItem>
            <SelectItem value="Barman">Barman</SelectItem>
            <SelectItem value="Hôte/Hôtesse">Hôte/Hôtesse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Disponibilités</label>
        <div className="flex flex-wrap gap-2">
          {[
            { day: "Monday", label: "Lun" },
            { day: "Tuesday", label: "Mar" },
            { day: "Wednesday", label: "Mer" },
            { day: "Thursday", label: "Jeu" },
            { day: "Friday", label: "Ven" },
            { day: "Saturday", label: "Sam" },
            { day: "Sunday", label: "Dim" },
          ].map(({ day, label }) => (
            <Button
              key={day}
              type="button"
              variant={
                formData.availableDays.includes(day) ? "default" : "outline"
              }
              className="h-9 px-3"
              onClick={() => handleDayToggle(day)}
              disabled={isSaving}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Horaires préférés</label>
        <Select
          value={formData.preferredHours}
          onValueChange={(value) => handleChange("preferredHours", value)}
          disabled={isSaving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un horaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Matin">Matin (11h-17h)</SelectItem>
            <SelectItem value="Soir">Soir (17h-00h)</SelectItem>
            <SelectItem value="Nuit">Nuit (00h-7h)</SelectItem>
            <SelectItem value="Flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              {employee ? "Enregistrement..." : "Ajout..."}
            </>
          ) : employee ? (
            "Enregistrer"
          ) : (
            "Ajouter"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default EmployeeManagement;
