import React, { useState } from "react";
import { cn } from "../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Filter, X } from "lucide-react";

interface FilterBarProps {
  onFilterChange?: (filters: FilterOptions) => void;
  className?: string;
}

interface FilterOptions {
  employee: string;
  day: string;
  shiftType: string;
  searchTerm: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  onFilterChange = () => {},
  className,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    employee: "all-employees",
    day: "all-days",
    shiftType: "all-shifts",
    searchTerm: "",
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      employee: "all-employees",
      day: "all-days",
      shiftType: "all-shifts",
      searchTerm: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div
      className={cn(
        "bg-white p-4 border-b flex flex-wrap items-center gap-3",
        className,
      )}
    >
      <div className="flex items-center relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Rechercher un employé..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          className="pl-9 pr-4"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-[180px]">
          <Select
            value={filters.employee}
            onValueChange={(value) => handleFilterChange("employee", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les employés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-employees">Tous les employés</SelectItem>
              <SelectItem value="John Smith">John Smith</SelectItem>
              <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
              <SelectItem value="Mike Williams">Mike Williams</SelectItem>
              <SelectItem value="Lisa Brown">Lisa Brown</SelectItem>
              <SelectItem value="David Miller">David Miller</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[150px]">
          <Select
            value={filters.day}
            onValueChange={(value) => handleFilterChange("day", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les jours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-days">Tous les jours</SelectItem>
              <SelectItem value="Monday">Lundi</SelectItem>
              <SelectItem value="Tuesday">Mardi</SelectItem>
              <SelectItem value="Wednesday">Mercredi</SelectItem>
              <SelectItem value="Thursday">Jeudi</SelectItem>
              <SelectItem value="Friday">Vendredi</SelectItem>
              <SelectItem value="Saturday">Samedi</SelectItem>
              <SelectItem value="Sunday">Dimanche</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select
            value={filters.shiftType}
            onValueChange={(value) => handleFilterChange("shiftType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-shifts">Tous les shifts</SelectItem>
              <SelectItem value="morning">Matin (11h-17h)</SelectItem>
              <SelectItem value="evening">Soir (17h-00h)</SelectItem>
              <SelectItem value="night">Nuit (00h-7h)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(filters.employee !== "all-employees" ||
          filters.day !== "all-days" ||
          filters.shiftType !== "all-shifts" ||
          filters.searchTerm) && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10"
            title="Effacer les filtres"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {(filters.employee !== "all-employees" ||
          filters.day !== "all-days" ||
          filters.shiftType !== "all-shifts" ||
          filters.searchTerm) && (
          <div className="flex items-center text-sm text-slate-500 ml-2">
            <Filter className="h-4 w-4 mr-1" />
            <span>Filtres appliqués</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
