"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export function DateRangePicker({
  className,
  onDateRangeChange,
  value,
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(value);

  const handleSelect = (newDate) => {
    setTempDate(newDate);
  };
  console.log("Temp Date:", tempDate);

  const handleApply = () => {
    setDate(tempDate);
    onDateRangeChange?.(tempDate);
    setIsOpen(false);
    if (tempDate?.from && tempDate?.to) {
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setTempDate(date);
  };

  React.useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(date)) {
      setDate(value);
      setTempDate(value);
    }
  }, [value]);

  const presetOptions = [
    {
      label: "Today",
      action: () => {
        const today = new Date();
        handleSelect({ from: today, to: today });
      },
    },
    {
      label: "Yesterday",
      action: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        handleSelect({ from: yesterday, to: yesterday });
      },
    },
    {
      label: "This Week",
      action: () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        handleSelect({ from: startOfWeek, to: today });
      },
    },
    {
      label: "Last Week",
      action: () => {
        const today = new Date();
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        handleSelect({ from: lastWeekStart, to: lastWeekEnd });
      },
    },
    {
      label: "Last 7 Days",
      action: () => {
        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        handleSelect({ from: last7Days, to: today });
      },
    },
    {
      label: "Last 14 Days",
      action: () => {
        const today = new Date();
        const last14Days = new Date(today);
        last14Days.setDate(today.getDate() - 14);
        handleSelect({ from: last14Days, to: today });
      },
    },
    {
      label: "This Month",
      action: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        handleSelect({ from: startOfMonth, to: today });
      },
    },
    {
      label: "Last 30 Days",
      action: () => {
        const today = new Date();
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        handleSelect({ from: last30Days, to: today });
      },
    },
    {
      label: "Last Month",
      action: () => {
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        const startOfLastMonth = new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth(),
          1
        );
        const endOfLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        handleSelect({ from: startOfLastMonth, to: endOfLastMonth });
      },
    },
    {
      label: "All Time",
      action: () => {
        const today = new Date();
        const startOfTime = new Date(2020, 0, 1);
        handleSelect({ from: startOfTime, to: today });
      },
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            size="sm"
            className={cn(
              "w-[200px] justify-start text-left font-normal bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd")} - {format(date.to, "MMM dd, y")}
                </>
              ) : (
                format(date.from, "MMM dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg border-0" align="end">
          <div className="flex bg-white rounded-lg overflow-hidden">
            {/* Left Sidebar - Presets */}
            <div className="w-36 bg-gray-50 border-r border-gray-100">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                  Quick Select
                </div>
                <div className="space-y-0.5">
                  {presetOptions.map((preset) => (
                    <button
                      key={preset.label}
                      className="w-full text-left text-xs px-2 py-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-gray-700"
                      onClick={preset.action}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-3">
              {/* Compact Date Inputs */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      Start Date*
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                   transition-all duration-200 hover:border-gray-400"
                      value={
                        tempDate?.from
                          ? format(tempDate.from, "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) => {
                        const newDate = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        setTempDate((prev) => {
                          let updated = {
                            from: newDate,
                            to: prev?.to ?? undefined,
                          };
                          if (
                            updated.to &&
                            updated.from &&
                            updated.from > updated.to
                          ) {
                            updated.to = updated.from;
                          }
                          return updated;
                        });
                      }}
                    />
                  </div>

                  <div className="pt-6 text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">
                      End Date*
                    </label>
                    <input
                      type="date"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                   transition-all duration-200 hover:border-gray-400"
                      value={
                        tempDate?.to ? format(tempDate.to, "yyyy-MM-dd") : ""
                      }
                      onChange={(e) => {
                        const newDate = e.target.value
                          ? new Date(e.target.value)
                          : undefined;
                        setTempDate((prev) => {
                          let updated = {
                            from: prev?.from ?? undefined,
                            to: newDate,
                          };
                          if (
                            updated.from &&
                            updated.to &&
                            updated.to < updated.from
                          ) {
                            updated.from = updated.to;
                          }
                          return updated;
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Duration Display */}
                {tempDate?.from && tempDate?.to && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>
                        Duration:{" "}
                        {Math.ceil(
                          (tempDate.to.getTime() - tempDate.from.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{" "}
                        days
                      </span>
                      <span className="text-green-600 font-medium">
                        ✓ Valid range
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Calendar */}
              <div className="calendar-container bg-gray-100 rounded-md border border-gray-100 p-2">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={tempDate?.from}
                  selected={tempDate}
                  onSelect={handleSelect}
                  numberOfMonths={2}
                  className="rounded-md"
                  classNames={{
                    months: "flex space-x-4",
                    month: "space-y-3",
                    caption:
                      "flex justify-center pt-2 pb-3 relative items-center",
                    caption_label: "text-sm font-semibold text-gray-800",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-white border border-gray-200 p-0 hover:bg-gray-50 rounded-md shadow-sm transition-colors",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex mb-2",
                    head_cell:
                      "text-gray-500 rounded-md w-8 font-medium text-xs text-center py-1",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal hover:bg-blue-50 hover:text-blue-600 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    day_selected:
                      "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white shadow-md",
                    day_today:
                      "bg-orange-100 text-orange-700 font-medium border border-orange-200",
                    day_outside: "text-gray-300",
                    day_disabled:
                      "text-gray-300 cursor-not-allowed hover:bg-transparent",
                    day_range_middle:
                      "aria-selected:bg-blue-100 aria-selected:text-blue-700 hover:bg-blue-100 hover:text-blue-700",
                    day_range_start: "rounded-l-md rounded-r-none",
                    day_range_end: "rounded-r-md rounded-l-none",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              {/* Compact Action Buttons */}
              {tempDate && (
                <div className="flex justify-end gap-2 mt-3 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    className="h-7 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Apply
                  </Button>
                </div>
              )}

            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
