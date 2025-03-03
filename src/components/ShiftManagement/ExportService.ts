import { Shift } from "@/lib/api";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Service for exporting shifts to PDF or Excel
export class ExportService {
  static async exportToPDF(
    shifts: Shift[],
    options: ExportOptions,
  ): Promise<boolean> {
    try {
      console.log("Exporting to PDF with options:", options);
      // Format data for export
      const formattedData = this.formatShiftsForExport(shifts, options);

      // Generate PDF content
      const doc = new jsPDF();

      // Add header
      if (options.includeHeader) {
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("Planning Hebdomadaire - Burger Staff Manager", 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);

        // Use week info from options if available
        const weekInfo = options.weekInfo || {
          formattedRange: "Semaine actuelle",
        };
        doc.text(`Semaine du ${weekInfo.formattedRange}`, 14, 30);
        doc.line(14, 35, 196, 35);
      }

      // Add restaurant info
      if (options.includeRestaurantInfo) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Burger Staff Restaurant", 14, 42);
        doc.text("123 Rue de la Restauration", 14, 47);
        doc.text("75001 Paris, France", 14, 52);
        doc.text("Tel: +33 1 23 45 67 89", 14, 57);
      }

      let yPosition = options.includeRestaurantInfo ? 70 : 45;

      // Add weekly view
      if (options.includeWeeklyView) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Vue Hebdomadaire", 14, yPosition);
        yPosition += 10;

        // Create table headers
        const headers = [
          ["Jour", "Matin (11h-17h)", "Soir (17h-00h)", "Nuit (00h-7h)"],
        ];

        // Create table data
        const tableData = [];
        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const daysFr = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche",
        ];

        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const dayShifts = formattedData.shiftsByDay[day] || [];

          const morningShifts = dayShifts
            .filter((s) => s.shiftType === "morning")
            .map((s) => s.employeeName)
            .join(", ");
          const eveningShifts = dayShifts
            .filter((s) => s.shiftType === "evening")
            .map((s) => s.employeeName)
            .join(", ");
          const nightShifts = dayShifts
            .filter((s) => s.shiftType === "night")
            .map((s) => s.employeeName)
            .join(", ");

          tableData.push([
            daysFr[i],
            morningShifts,
            eveningShifts,
            nightShifts,
          ]);
        }

        // @ts-ignore - jspdf-autotable types
        doc.autoTable({
          head: headers,
          body: tableData,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 245, 255] },
        });

        // @ts-ignore - get the last table's y position
        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // Add hours summary
      if (options.includeHoursSummary) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Résumé des Heures", 14, yPosition);
        yPosition += 10;

        const headers = [["Employé", "Heures Totales", "Shifts"]];
        const tableData = [];

        // Count shifts per employee
        const shiftsPerEmployee: Record<string, number> = {};
        shifts.forEach((shift) => {
          if (shiftsPerEmployee[shift.employeeName]) {
            shiftsPerEmployee[shift.employeeName]++;
          } else {
            shiftsPerEmployee[shift.employeeName] = 1;
          }
        });

        // Create table rows
        Object.entries(formattedData.employeeHours)
          .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
          .forEach(([name, hours]) => {
            tableData.push([name, `${hours}h`, shiftsPerEmployee[name] || 0]);
          });

        // Add total row
        tableData.push([
          "TOTAL",
          `${formattedData.totalHours}h`,
          formattedData.totalShifts,
        ]);

        // @ts-ignore - jspdf-autotable types
        doc.autoTable({
          head: headers,
          body: tableData,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [79, 70, 229], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 255] },
          foot: [
            [
              "TOTAL",
              `${formattedData.totalHours}h`,
              formattedData.totalShifts,
            ],
          ],
          footStyles: { fillColor: [220, 220, 250], fontStyle: "bold" },
        });

        // @ts-ignore - get the last table's y position
        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // Add daily breakdown
      if (options.includeDailyBreakdown) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("Répartition Quotidienne", 14, yPosition);
        yPosition += 10;

        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const daysFr = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche",
        ];

        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const dayShifts = formattedData.shiftsByDay[day] || [];

          if (dayShifts.length > 0) {
            // Add day header
            doc.setFontSize(12);
            doc.setTextColor(40, 40, 40);
            doc.text(daysFr[i], 14, yPosition);
            yPosition += 7;

            // Create table for this day
            const headers = [["Employé", "Début", "Fin", "Durée", "Type"]];
            const tableData = dayShifts.map((shift) => {
              // Calculate duration
              const startHour = parseInt(shift.startTime.split(":")[0]);
              const endHour = parseInt(shift.endTime.split(":")[0]);
              let hours = 0;

              if (endHour > startHour) {
                hours = endHour - startHour;
              } else {
                hours = 24 - startHour + endHour;
              }

              // Map shift type to French
              const shiftTypeFr =
                {
                  morning: "Matin",
                  evening: "Soir",
                  night: "Nuit",
                }[shift.shiftType] || shift.shiftType;

              return [
                shift.employeeName,
                shift.startTime,
                shift.endTime,
                `${hours}h`,
                shiftTypeFr,
              ];
            });

            // @ts-ignore - jspdf-autotable types
            doc.autoTable({
              head: headers,
              body: tableData,
              startY: yPosition,
              theme: "grid",
              styles: { fontSize: 8, cellPadding: 2 },
              headStyles: { fillColor: [34, 197, 94], textColor: 255 },
              alternateRowStyles: { fillColor: [240, 250, 240] },
              margin: { left: 30 },
              tableWidth: 150,
            });

            // @ts-ignore - get the last table's y position
            yPosition = doc.lastAutoTable.finalY + 10;

            // Add a new page if we're running out of space
            if (yPosition > 270 && i < days.length - 1) {
              doc.addPage();
              yPosition = 20;
            }
          }
        }
      }

      // Add footer
      if (options.includeFooter) {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(
            `Burger Staff Manager - Planning généré le ${new Date().toLocaleDateString("fr-FR")} - Page ${i}/${pageCount}`,
            pageSize.width / 2,
            pageHeight - 10,
            { align: "center" },
          );
        }
      }

      // Save the PDF
      const currentDate = new Date().toISOString().split("T")[0];
      doc.save(`planning-burger-staff-${currentDate}.pdf`);

      // Show success notification
      if (window.showNotification) {
        window.showNotification({
          title: "Exportation réussie",
          description: "Le planning a été exporté au format PDF avec succès.",
          variant: "success",
          position: "bottom-right",
        });
      }

      return true;
    } catch (error) {
      console.error("Error exporting to PDF:", error);

      // Show error notification
      if (window.showNotification) {
        window.showNotification({
          title: "Erreur d'exportation",
          description:
            "Une erreur est survenue lors de l'exportation du planning en PDF.",
          variant: "error",
          position: "bottom-right",
        });
      }

      return false;
    }
  }

  static async exportToExcel(
    shifts: Shift[],
    options: ExportOptions,
  ): Promise<boolean> {
    try {
      console.log("Exporting to Excel with options:", options);
      // Format data for export
      const formattedData = this.formatShiftsForExport(shifts, options);

      // In a real implementation, we would use a library like xlsx
      // For this demo, we'll create a CSV file which can be opened in Excel

      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add header
      csvContent += "Planning Hebdomadaire - Burger Staff Manager\n";

      // Use week info from options if available
      const weekInfo = options.weekInfo || {
        formattedRange: "Semaine actuelle",
      };
      csvContent += `Semaine du ${weekInfo.formattedRange}\n\n`;

      // Add weekly view
      if (options.includeWeeklyView) {
        csvContent += "Vue Hebdomadaire\n";
        csvContent += "Jour,Matin (11h-17h),Soir (17h-00h),Nuit (00h-7h)\n";

        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const daysFr = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche",
        ];

        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const dayShifts = formattedData.shiftsByDay[day] || [];

          const morningShifts = dayShifts
            .filter((s) => s.shiftType === "morning")
            .map((s) => s.employeeName)
            .join(", ");
          const eveningShifts = dayShifts
            .filter((s) => s.shiftType === "evening")
            .map((s) => s.employeeName)
            .join(", ");
          const nightShifts = dayShifts
            .filter((s) => s.shiftType === "night")
            .map((s) => s.employeeName)
            .join(", ");

          csvContent += `${daysFr[i]},"${morningShifts}","${eveningShifts}","${nightShifts}"\n`;
        }

        csvContent += "\n";
      }

      // Add hours summary
      if (options.includeHoursSummary) {
        csvContent += "Résumé des Heures\n";
        csvContent += "Employé,Heures Totales,Shifts\n";

        // Count shifts per employee
        const shiftsPerEmployee: Record<string, number> = {};
        shifts.forEach((shift) => {
          if (shiftsPerEmployee[shift.employeeName]) {
            shiftsPerEmployee[shift.employeeName]++;
          } else {
            shiftsPerEmployee[shift.employeeName] = 1;
          }
        });

        // Create table rows
        Object.entries(formattedData.employeeHours)
          .sort(([, hoursA], [, hoursB]) => hoursB - hoursA)
          .forEach(([name, hours]) => {
            csvContent += `"${name}",${hours}h,${shiftsPerEmployee[name] || 0}\n`;
          });

        // Add total row
        csvContent += `TOTAL,${formattedData.totalHours}h,${formattedData.totalShifts}\n\n`;
      }

      // Add daily breakdown
      if (options.includeDailyBreakdown) {
        csvContent += "Répartition Quotidienne\n";

        const days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const daysFr = [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche",
        ];

        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const dayShifts = formattedData.shiftsByDay[day] || [];

          if (dayShifts.length > 0) {
            csvContent += `${daysFr[i]}\n`;
            csvContent += "Employé,Début,Fin,Durée,Type\n";

            dayShifts.forEach((shift) => {
              // Calculate duration
              const startHour = parseInt(shift.startTime.split(":")[0]);
              const endHour = parseInt(shift.endTime.split(":")[0]);
              let hours = 0;

              if (endHour > startHour) {
                hours = endHour - startHour;
              } else {
                hours = 24 - startHour + endHour;
              }

              // Map shift type to French
              const shiftTypeFr =
                {
                  morning: "Matin",
                  evening: "Soir",
                  night: "Nuit",
                }[shift.shiftType] || shift.shiftType;

              csvContent += `"${shift.employeeName}",${shift.startTime},${shift.endTime},${hours}h,${shiftTypeFr}\n`;
            });

            csvContent += "\n";
          }
        }
      }

      // Add employee details if requested
      if (options.includeEmployeeDetails) {
        csvContent += "Détails des Employés\n";
        csvContent += "Nom,Position,Téléphone,Email\n";

        // Create a unique list of employees from shifts
        const uniqueEmployees = Array.from(
          new Set(shifts.map((s) => s.employeeName)),
        );

        // Mock employee details
        const employeeDetails: Record<
          string,
          { position: string; phone: string; email: string }
        > = {
          "John Smith": {
            position: "Chef",
            phone: "06 12 34 56 78",
            email: "john.smith@example.com",
          },
          "Sarah Johnson": {
            position: "Serveuse",
            phone: "06 23 45 67 89",
            email: "sarah.johnson@example.com",
          },
          "Mike Williams": {
            position: "Barman",
            phone: "06 34 56 78 90",
            email: "mike.williams@example.com",
          },
          "Lisa Brown": {
            position: "Serveuse",
            phone: "06 45 67 89 01",
            email: "lisa.brown@example.com",
          },
          "David Miller": {
            position: "Cuisinier",
            phone: "06 56 78 90 12",
            email: "david.miller@example.com",
          },
        };

        uniqueEmployees.forEach((name) => {
          const details = employeeDetails[name] || {
            position: "",
            phone: "",
            email: "",
          };
          csvContent += `"${name}","${details.position}","${details.phone}","${details.email}"\n`;
        });
      }

      // Encode the CSV content
      const encodedUri = encodeURI(csvContent);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const currentDate = new Date().toISOString().split("T")[0];
      link.setAttribute("download", `planning-burger-staff-${currentDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success notification
      if (window.showNotification) {
        window.showNotification({
          title: "Exportation réussie",
          description:
            "Le planning a été exporté au format Excel (CSV) avec succès.",
          variant: "success",
          position: "bottom-right",
        });
      }

      return true;
    } catch (error) {
      console.error("Error exporting to Excel:", error);

      // Show error notification
      if (window.showNotification) {
        window.showNotification({
          title: "Erreur d'exportation",
          description:
            "Une erreur est survenue lors de l'exportation du planning en Excel.",
          variant: "error",
          position: "bottom-right",
        });
      }

      return false;
    }
  }

  // Helper method to format shifts for export
  static formatShiftsForExport(shifts: Shift[], options: ExportOptions) {
    // Group shifts by day
    const shiftsByDay: Record<string, Shift[]> = {};
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    days.forEach((day) => {
      shiftsByDay[day] = shifts.filter((shift) => shift.day === day);
    });

    // Calculate employee hours
    const employeeHours: Record<string, number> = {};
    shifts.forEach((shift) => {
      const startHour = parseInt(shift.startTime.split(":")[0]);
      const endHour = parseInt(shift.endTime.split(":")[0]);
      let hours = 0;

      if (endHour > startHour) {
        hours = endHour - startHour;
      } else {
        // Handle overnight shifts
        hours = 24 - startHour + endHour;
      }

      if (employeeHours[shift.employeeName]) {
        employeeHours[shift.employeeName] += hours;
      } else {
        employeeHours[shift.employeeName] = hours;
      }
    });

    return {
      shiftsByDay,
      employeeHours,
      totalHours: Object.values(employeeHours).reduce(
        (sum, hours) => sum + hours,
        0,
      ),
      totalShifts: shifts.length,
    };
  }
}

export interface ExportOptions {
  includeEmployeeDetails: boolean;
  includeHoursSummary: boolean;
  includeWeeklyView: boolean;
  includeDailyBreakdown: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  includeRestaurantInfo: boolean;
  includeEmployeeContacts: boolean;
  weekInfo?: {
    start: string;
    end: string;
    formattedRange: string;
  };
}
