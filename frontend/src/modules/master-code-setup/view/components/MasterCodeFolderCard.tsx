import { CodeXml, Folder } from "lucide-react";
import type { MasterCodeResponseDto } from "../../model/master-code-setup.types";
import { cn } from "@/shared/lib/cn";

interface MasterCodeFolderCardProps {
  code: MasterCodeResponseDto;
  onClick?: (code: MasterCodeResponseDto) => void;
}

export const MasterCodeFolderCard = ({
  code,
  onClick,
}: MasterCodeFolderCardProps) => {
  return (
    <div
      className={cn(
        "group relative p-4 border rounded-2xl bg-card hover:shadow-md transition-all cursor-pointer",
        "flex flex-col items-center justify-center gap-3 min-h-[160px]",
        onClick && "hover:border-primary"
      )}
      onClick={() => onClick?.(code)}
    >
      {/* Folder Icon */}
      <div className="flex items-center justify-center w-16 h-16">
        <CodeXml className="w-12 h-12 text-primary" />
      </div>

      {/* Code Name */}
      <div className="text-center w-full">
        <p className="text-sm font-medium text-foreground truncate">
          {code.codeName}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Code: {code.code}</p>
      </div>
    </div>
  );
};
