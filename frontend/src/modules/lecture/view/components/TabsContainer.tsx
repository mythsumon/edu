import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@/shared/ui/tabs";

export type TabConfig = {
  value: string;
  label: ReactNode;
  content: ReactNode;
  triggerClassName?: string;
  isHeaderDisplay?: boolean;
};

type TabContainerProps = {
  tabs: TabConfig[];
  currentValue?: string;
  defaultValue?: string;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  triggerClassName?: string;
  onValueChange?: (value: string) => void;
};

/**
 * Tab Container Component
 * Displays tabs with content, positioned under filter/search bar
 */
export const TabContainer = ({
  tabs,
  currentValue,
  defaultValue,
  className,
  listClassName,
  contentClassName,
  triggerClassName,
  onValueChange,
}: TabContainerProps) => {
  if (!tabs.length) return null;

  const computedDefault = defaultValue || tabs[0].value;

  return (
    <Tabs
      value={currentValue || computedDefault}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          "inline-flex h-auto w-full items-center justify-start gap-2 bg-transparent p-0 border-b border-border",
          listClassName
        )}
      >
        {tabs
          .filter((tab) => tab.isHeaderDisplay !== false)
          .map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-badge data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:border-b-2 hover:border-slate-800",
                triggerClassName,
                tab.triggerClassName
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-0 pt-2", contentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
