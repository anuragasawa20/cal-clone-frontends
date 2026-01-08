'use client';

import * as React from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"

// Simple chevron icons
const ChevronLeft = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
)

const ChevronRight = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
)

export function Calendar({
    className,
    selected,
    onSelect,
    disabled,
    markedDates = [], // Array of dates to mark with indicators
    availableDates = [], // Array of dates that are available (for styling)
    ...props
}) {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    const isDateDisabled = (date) => {
        if (disabled) {
            return disabled(date)
        }
        return false
    }

    const isSelected = (date) => {
        return selected && isSameDay(date, selected)
    }

    const isCurrentMonth = (date) => {
        return isSameMonth(date, currentMonth)
    }

    const isMarked = (date) => {
        return markedDates.some(markedDate => isSameDay(date, markedDate))
    }

    const isAvailable = (date) => {
        return availableDates.some(availDate => isSameDay(date, availDate))
    }

    return (
        <div className={cn("", className)} {...props}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                        key={day}
                        className="h-10 flex items-center justify-center text-sm font-medium text-zinc-500 dark:text-zinc-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const dateDisabled = isDateDisabled(day)
                    const dateSelected = isSelected(day)
                    const dateCurrentMonth = isCurrentMonth(day)
                    const today = isSameDay(day, new Date())
                    const marked = isMarked(day)
                    const available = isAvailable(day)

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => !dateDisabled && onSelect && onSelect(day)}
                            disabled={dateDisabled}
                            className={cn(
                                "h-10 w-10 rounded-md text-sm font-medium transition-colors relative",
                                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                !dateCurrentMonth && "text-zinc-300 dark:text-zinc-700",
                                dateCurrentMonth && !dateSelected && "text-zinc-900 dark:text-zinc-100 bg-transparent",
                                dateSelected && "bg-white text-black dark:bg-white dark:text-black hover:bg-zinc-200 dark:hover:bg-zinc-200 border-2 border-white",
                                dateDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                                today && !dateSelected && "font-semibold",
                                // Available dates styling - transparent background
                                available && !dateSelected && dateCurrentMonth && "bg-transparent"
                            )}
                        >
                            {format(day, 'd')}
                            {/* Mark indicator dot */}
                            {marked && !dateSelected && (
                                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
