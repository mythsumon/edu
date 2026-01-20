import * as React from "react"
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"
import { useTranslation } from "react-i18next"

import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  showTodayButton = true,
  onSelectToday,
  formatters,
  components,
  month,
  onMonthChange,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  showTodayButton?: boolean
  onSelectToday?: (date: Date) => void
}) {
  const { t } = useTranslation()
  const defaultClassNames = getDefaultClassNames()
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date())

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const goToPreviousYear = () => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(newDate.getFullYear() - 1)
    handleMonthChange(newDate)
  }

  const goToNextYear = () => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(newDate.getFullYear() + 1)
    handleMonthChange(newDate)
  }

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    handleMonthChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    handleMonthChange(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    handleMonthChange(today)
    onSelectToday?.(today)
  }

  const monthYearLabel = currentMonth.toLocaleString("default", {
    month: "short",
    year: "numeric",
  })

  return (
    <div className="flex flex-col">
      {/* Custom Navigation Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={goToPreviousYear}
            type="button"
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={goToPreviousMonth}
            type="button"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm font-medium select-none">
          {monthYearLabel}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={goToNextMonth}
            type="button"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={goToNextYear}
            type="button"
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "bg-background group/calendar px-3 pb-3 [--cell-size:2.8rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          className
        )}
        captionLayout={captionLayout}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        hideNavigation
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-4 md:flex-row",
            defaultClassNames.months
          ),
          month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
          nav: cn("hidden", defaultClassNames.nav),
          button_previous: cn("hidden", defaultClassNames.button_previous),
          button_next: cn("hidden", defaultClassNames.button_next),
          month_caption: cn("hidden", defaultClassNames.month_caption),
          dropdowns: cn("hidden", defaultClassNames.dropdowns),
          dropdown_root: cn("hidden", defaultClassNames.dropdown_root),
          dropdown: cn("hidden", defaultClassNames.dropdown),
          caption_label: cn("hidden", defaultClassNames.caption_label),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-muted-foreground flex-1 select-none rounded-md text-sm font-normal w-[--cell-size] h-[--cell-size] flex items-center justify-center",
            defaultClassNames.weekday
          ),
          week: cn("mt-1 flex w-full", defaultClassNames.week),
          week_number_header: cn(
            "w-[--cell-size] select-none",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-muted-foreground select-none text-sm",
            defaultClassNames.week_number
          ),
          day: cn(
            "group/day relative aspect-square h-full w-full select-none p-0 text-center flex items-center justify-center [&:first-child[data-selected=true]_button]:rounded-xl [&:last-child[data-selected=true]_button]:rounded-xl",
            defaultClassNames.day
          ),
          range_start: cn(
            "bg-accent rounded-xl",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("bg-accent rounded-xl", defaultClassNames.range_end),
          today: cn(
            "[&_button]:ring-1 [&_button]:ring-secondary-foreground/40 [&_button[data-selected-single=true]]:ring-0",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground/40 aria-selected:text-muted-foreground/40",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(className)}
                {...props}
              />
            )
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-[--cell-size] items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />

      {/* Today Button */}
      {showTodayButton && (
        <div className="border-t px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-sm md:text-xs font-normal text-muted-foreground hover:text-foreground"
            onClick={goToToday}
            type="button"
          >
            {t("calendar.today")}
          </Button>
        </div>
      )}
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-8 w-8 flex-col gap-1 font-normal leading-none rounded-xl data-[range-end=true]:rounded-xl data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-xl group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] text-sm hover:bg-accent",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
