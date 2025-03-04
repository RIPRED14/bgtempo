import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Send, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import EmployeeLayout from "./EmployeeLayout";

const EmployeeAbsenceRequest: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeInfo, setEmployeeInfo] = useState<{
    id: string;
    name: string;
    username: string;
  } | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!startDate) {
      setError("Veuillez sélectionner une date de début");
      return;
    }

    if (!endDate) {
      setError("Veuillez sélectionner une date de fin");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("La date de début doit être antérieure à la date de fin");
      return;
    }

    if (!reason.trim()) {
      setError("Veuillez indiquer un motif d'absence");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, we would send this to the server
        const absenceRequest = {
          employeeId: employeeInfo?.id,
          employeeName: employeeInfo?.name,
          startDate,
          endDate,
          reason,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        // Store in localStorage for demo purposes
        const savedRequests = localStorage.getItem("absenceRequests") || "[]";
        const requests = JSON.parse(savedRequests);
        requests.push(absenceRequest);
        localStorage.setItem("absenceRequests", JSON.stringify(requests));

        // Show success message
        toast({
          title: "Demande envoyée",
          description: "Votre demande d'absence a été envoyée avec succès.",
          variant: "success",
        });

        // Reset form
        setStartDate("");
        setEndDate("");
        setReason("");
      } catch (error) {
        console.error("Error submitting absence request:", error);
        setError("Une erreur est survenue lors de l'envoi de la demande");
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
            <Calendar className="h-6 w-6 mr-2 text-blue-600" />
            Demande d'absence
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

        <Card>
          <CardHeader>
            <CardTitle>Nouvelle demande d'absence</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif de l'absence</Label>
                <Textarea
                  id="reason"
                  placeholder="Veuillez indiquer le motif de votre absence..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer la demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeAbsenceRequest;
