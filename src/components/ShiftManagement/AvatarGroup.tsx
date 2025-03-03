import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AvatarGroupProps {
  names: string[];
  max?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ names, max = 3 }) => {
  // Limit the number of avatars shown
  const visibleNames = names.slice(0, max);
  const remainingCount = names.length - max;
  const hiddenNames = names.slice(max);

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visibleNames.map((name, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-blue-600 text-xs font-medium ring-2 ring-white hover:ring-blue-200 transition-all cursor-pointer"
                title={name}
                style={{
                  backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/ /g, "")}')`,
                  backgroundSize: "cover",
                  zIndex: visibleNames.length - index,
                }}
              >
                {/* Initials as fallback */}
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white text-xs font-medium ring-2 ring-white hover:bg-gray-600 transition-all cursor-pointer"
                style={{ zIndex: 0 }}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-bold">Autres employés:</p>
                {hiddenNames.map((name, i) => (
                  <p key={i} className="text-sm">
                    {name}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default AvatarGroup;
