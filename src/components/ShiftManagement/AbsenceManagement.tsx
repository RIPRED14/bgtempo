import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Calendar,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import { Sidebar } from "../Admin/Sidebar";
import {
  fetchEmployees,
  fetchAbsences,
  createAbsence,
  updateAbsence,
  deleteAbsence,
  Absence,
  Employee,
} from "@/lib/api";

const AbsenceManagement: React.FC = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [employeesData, absencesData] = await Promise.all([
        fetchEmployees(),
        fetchAbsences(),
      ]);
      setEmployees(employeesData);
      setAbsences(absencesData);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const filteredAbsences = absences.filter((absence) => {
    if (
      searchTerm &&
      !absence.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !absence.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleAddAbsence = () => {
    setEditMode(false);
    setSelectedAbsence(null);
    setDialogOpen(true);
  };

  const handleEditAbsence = (absence: Absence) => {
    setEditMode(true);
    setSelectedAbsence(absence);
    setDialogOpen(true);
  };

  const handleDeleteAbsence = (absence: Absence) => {
    setSelectedAbsence(absence);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedAbsence) {
      setIsLoading(true);
      const success = await deleteAbsence(selectedAbsence.id);
      if (success) {
        setAbsences(absences.filter((a) => a.id !== selectedAbsence.id));
      }
      setConfirmDeleteOpen(false);
      setIsLoading(false);
    }
  };

  const saveAbsence = async (formData: any) => {
    setIsLoading(true);
    if (editMode && selectedAbsence) {
      // Update existing absence
      const updatedAbsence = await updateAbsence({
        id: selectedAbsence.id,
        employeeId: formData.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      if (updatedAbsence) {
        setAbsences(
          absences.map((a) =>
            a.id === selectedAbsence.id ? updatedAbsence : a,
          ),
        );
      }
    } else {
      // Add new absence
      const newAbsence = await createAbsence({
        employeeId: formData.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      if (newAbsence) {
        setAbsences([...absences, newAbsence]);
      }
    }
    setDialogOpen(false);
    setIsLoading(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-auto">
        <Card className="border-none shadow-none rounded-none">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-amber-600" />
                Gestion des Absences
              </CardTitle>
              <Button
                onClick={handleAddAbsence}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Signaler une absence
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Search */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher une absence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm("")}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Separator />

              {/* Absences table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Début</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-slate-500"
                        >
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : filteredAbsences.length > 0 ? (
                      filteredAbsences.map((absence) => (
                        <TableRow key={absence.id}>
                          <TableCell className="font-medium">
                            {absence.employeeName}
                          </TableCell>
                          <TableCell>{formatDate(absence.startDate)}</TableCell>
                          <TableCell>{formatDate(absence.endDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                calculateDuration(
                                  absence.startDate,
                                  absence.endDate,
                                ) > 3
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {calculateDuration(
                                absence.startDate,
                                absence.endDate,
                              )}{" "}
                              jour
                              {calculateDuration(
                                absence.startDate,
                                absence.endDate,
                              ) > 1
                                ? "s"
                                : ""}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {absence.reason || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditAbsence(absence)}
                                className="h-8 w-8"
                                disabled={isLoading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAbsence(absence)}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                disabled={isLoading}
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
                          colSpan={6}
                          className="h-24 text-center text-slate-500"
                        >
                          Aucune absence trouvée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absence Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Modifier l'absence" : "Signaler une absence"}
              </DialogTitle>
            </DialogHeader>

            <AbsenceForm
              absence={selectedAbsence}
              employees={employees}
              onSave={saveAbsence}
              onCancel={() => setDialogOpen(false)}
              isLoading={isLoading}
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
                Êtes-vous sûr de vouloir supprimer cette absence pour{" "}
                <span className="font-bold">
                  {selectedAbsence?.employeeName}
                </span>{" "}
                ?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Cette action est irréversible.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  Annuler
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

interface AbsenceFormProps {
  absence: Absence | null;
  employees: Employee[];
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AbsenceForm: React.FC<AbsenceFormProps> = ({
  absence,
  employees,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<{
    employeeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    employeeId: absence?.employeeId || "",
    startDate: absence?.startDate || new Date().toISOString().split("T")[0],
    endDate: absence?.endDate || new Date().toISOString().split("T")[0],
    reason: absence?.reason || "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Employé</label>
        <Select
          value={formData.employeeId}
          onValueChange={(value) => handleChange("employeeId", value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un employé" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date de début</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date de fin</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Raison</label>
        <Textarea
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Raison de l'absence (optionnel)"
          rows={4}
          disabled={isLoading}
        />
      </div>

      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {absence ? "Enregistrer" : "Ajouter"}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default AbsenceManagement;
