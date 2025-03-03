import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  Clock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ShiftExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string, options: any) => void;
}

const ShiftExportModal: React.FC<ShiftExportModalProps> = ({
  isOpen,
  onOpenChange,
  onExport,
}) => {
  const [format, setFormat] = useState("pdf");
  const [options, setOptions] = useState({
    includeEmployeeDetails: true,
    includeHoursSummary: true,
    includeWeeklyView: true,
    includeDailyBreakdown: false,
    includeHeader: true,
    includeFooter: true,
    includeRestaurantInfo: true,
    includeEmployeeContacts: false,
  });

  // Simulate loading state for export
  const [isExporting, setIsExporting] = useState(false);

  const handleOptionChange = (option: string, checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      [option]: checked,
    }));
  };

  const handleExport = () => {
    setIsExporting(true);

    // Process export immediately
    onExport(format, options);

    // Close dialog after a short delay
    setTimeout(() => {
      setIsExporting(false);
      onOpenChange(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Exporter le planning
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">
                  Période d'exportation
                </h3>
                <p className="text-sm text-blue-600">Semaine actuelle</p>
                <p className="text-xs text-blue-500 mt-1">
                  Le planning de la semaine en cours sera exporté avec toutes
                  les données actuelles
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="pdf" onValueChange={setFormat}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="excel" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-4">
              <div className="flex items-center gap-2 mb-3 text-blue-600 font-medium">
                <FileText className="h-4 w-4" />
                Options d'exportation PDF
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf-employee-details"
                    checked={options.includeEmployeeDetails}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeEmployeeDetails",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="pdf-employee-details">
                    Inclure les détails des employés
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf-hours-summary"
                    checked={options.includeHoursSummary}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeHoursSummary",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="pdf-hours-summary">
                    Inclure le résumé des heures
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf-weekly-view"
                    checked={options.includeWeeklyView}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeWeeklyView",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="pdf-weekly-view">
                    Inclure la vue hebdomadaire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf-daily-breakdown"
                    checked={options.includeDailyBreakdown}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeDailyBreakdown",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="pdf-daily-breakdown">
                    Inclure la répartition quotidienne
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf-restaurant-info"
                    checked={options.includeRestaurantInfo}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeRestaurantInfo",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="pdf-restaurant-info">
                    Inclure les informations du restaurant
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pdf-employee-contacts"
                    checked={options.includeEmployeeContacts}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeEmployeeContacts",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="pdf-employee-contacts">
                    Inclure les contacts des employés
                  </Label>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">Aperçu du contenu</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>• Planning hebdomadaire de la semaine actuelle</p>
                  <p>
                    • {options.includeEmployeeDetails ? "Avec" : "Sans"} détails
                    des employés
                  </p>
                  <p>
                    • {options.includeHoursSummary ? "Avec" : "Sans"} résumé des
                    heures
                  </p>
                  <p>
                    • {options.includeWeeklyView ? "Avec" : "Sans"} vue
                    hebdomadaire
                  </p>
                  <p>
                    • {options.includeDailyBreakdown ? "Avec" : "Sans"}{" "}
                    répartition quotidienne
                  </p>
                  <p>
                    • {options.includeHeader ? "Avec" : "Sans"} en-tête et
                    {options.includeFooter ? " avec" : " sans"} pied de page
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="excel" className="mt-4">
              <div className="flex items-center gap-2 mb-3 text-green-600 font-medium">
                <FileSpreadsheet className="h-4 w-4" />
                Options d'exportation Excel
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excel-employee-details"
                    checked={options.includeEmployeeDetails}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeEmployeeDetails",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="excel-employee-details">
                    Inclure les détails des employés
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excel-hours-summary"
                    checked={options.includeHoursSummary}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeHoursSummary",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="excel-hours-summary">
                    Inclure le résumé des heures
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excel-separate-sheets"
                    checked={options.includeDailyBreakdown}
                    onCheckedChange={(checked) =>
                      handleOptionChange(
                        "includeDailyBreakdown",
                        checked as boolean,
                      )
                    }
                  />
                  <Label htmlFor="excel-separate-sheets">
                    Créer des feuilles séparées par jour
                  </Label>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">
                    Contenu du fichier Excel
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  <p>• Fichier CSV compatible avec Excel</p>
                  <p>• Planning hebdomadaire de la semaine actuelle</p>
                  <p>
                    • {options.includeDailyBreakdown ? "Avec" : "Sans"} sections
                    séparées par jour
                  </p>
                  <p>
                    • {options.includeEmployeeDetails ? "Avec" : "Sans"} section
                    de détails des employés
                  </p>
                  <p>
                    • {options.includeHoursSummary ? "Avec" : "Sans"} section de
                    résumé des heures
                  </p>
                  <p>
                    • {options.includeWeeklyView ? "Avec" : "Sans"} vue
                    hebdomadaire complète
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 min-w-[140px] bg-blue-600 hover:bg-blue-700"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                Exportation...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exporter en {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftExportModal;
