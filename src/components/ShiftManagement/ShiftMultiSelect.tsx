import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface ShiftMultiSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

const ShiftMultiSelect: React.FC<ShiftMultiSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Sélectionner...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedValues = value
    .split(",")
    .filter(Boolean)
    .map((v) => v.trim());

  const handleSelect = (optionValue: string) => {
    const newValues = [...selectedValues];
    if (!newValues.includes(optionValue)) {
      newValues.push(optionValue);
      onChange(newValues.join(", "));
    }
    setSearchTerm("");
  };

  const handleRemove = (optionValue: string) => {
    const newValues = selectedValues.filter((v) => v !== optionValue);
    onChange(newValues.join(", "));
  };

  const filteredOptions = options.filter(
    (option) =>
      !selectedValues.includes(option.value) &&
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative w-full">
      <div
        className="flex flex-wrap gap-1 p-2 border rounded-md min-h-10 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.length > 0 ? (
          selectedValues.map((val) => {
            const option = options.find((o) => o.value === val) || {
              label: val,
              value: val,
            };
            return (
              <Badge
                key={val}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(val);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })
        ) : (
          <span className="text-sm text-slate-500">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <Input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="border-0 border-b rounded-t-md rounded-b-none"
          />
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-2 hover:bg-slate-100 cursor-pointer rounded-md"
                  onClick={() => {
                    handleSelect(option.value);
                    if (filteredOptions.length === 1) {
                      setIsOpen(false);
                    }
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-slate-500">Aucun résultat</div>
            )}
          </div>
          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default ShiftMultiSelect;
