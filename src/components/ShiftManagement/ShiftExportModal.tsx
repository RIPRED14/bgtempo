import React, { useState } from "react";
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
import { FileText, FileSpreadsheet, Download } from "lucide-react";

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
  });

  const handleOptionChange = (option: string, checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      [option]: checked,
    }));
  };

  const handleExport = () => {
    onExport(format, options);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exporter le planning</DialogTitle>
        </DialogHeader>

        <div className="py-4">
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
              <div className="space-y-4">
                <div className="text-sm">Options d'exportation PDF:</div>
                <div className="space-y-2">
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
                </div>
              </div>
            </TabsContent>
            <TabsContent value="excel" className="mt-4">
              <div className="space-y-4">
                <div className="text-sm">Options d'exportation Excel:</div>
                <div className="space-y-2">
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
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftExportModal;
