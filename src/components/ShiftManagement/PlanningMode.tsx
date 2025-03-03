import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Grid3X3, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanningModeProps {
  currentMode: "normal" | "expanded" | "compact";
  onModeChange: (mode: "normal" | "expanded" | "compact") => void;
}

const PlanningMode: React.FC<PlanningModeProps> = ({
  currentMode = "normal",
  onModeChange,
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
      <Button
        variant={currentMode === "normal" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("normal")}
        className="flex items-center gap-1 h-8"
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="text-xs">Normal</span>
      </Button>
      <Button
        variant={currentMode === "expanded" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("expanded")}
        className="flex items-center gap-1 h-8"
      >
        <Calendar className="h-4 w-4" />
        <span className="text-xs">Étendu</span>
      </Button>
      <Button
        variant={currentMode === "compact" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("compact")}
        className="flex items-center gap-1 h-8"
      >
        <Users className="h-4 w-4" />
        <span className="text-xs">Compact</span>
      </Button>
    </div>
  );
};

export default PlanningMode;
