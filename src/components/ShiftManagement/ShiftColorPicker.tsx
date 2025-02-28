import React from "react";
import { cn } from "@/lib/utils";

interface ShiftColorPickerProps {
  value: "morning" | "evening" | "night";
  onChange: (value: "morning" | "evening" | "night") => void;
}

const ShiftColorPicker: React.FC<ShiftColorPickerProps> = ({
  value,
  onChange,
}) => {
  const colors = [
    {
      id: "morning",
      label: "Matin (11h-17h)",
      color: "bg-blue-500",
      selectedColor: "ring-blue-500",
    },
    {
      id: "evening",
      label: "Soir (17h-00h)",
      color: "bg-green-500",
      selectedColor: "ring-green-500",
    },
    {
      id: "night",
      label: "Nuit (00h-7h)",
      color: "bg-orange-500",
      selectedColor: "ring-orange-500",
    },
  ];

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-slate-500 mb-1">Type de shift</label>
      <div className="flex space-x-4">
        {colors.map((color) => (
          <div key={color.id} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() =>
                onChange(color.id as "morning" | "evening" | "night")
              }
              className={cn(
                "w-8 h-8 rounded-full",
                color.color,
                value === color.id
                  ? `ring-2 ring-offset-2 ${color.selectedColor}`
                  : "",
              )}
              aria-label={color.label}
            />
            <span className="text-xs mt-1">{color.label.split(" ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShiftColorPicker;
