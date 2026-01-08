'use client';

import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TimeSlotPicker({
    timeSlots = [],
    selectedTime,
    onSelect,
    timeFormat = '12h',
    timezone = 'UTC',
    selectedDate,
    className
}) {
    const [formatMode, setFormatMode] = useState(timeFormat);

    // Check if a time slot is in the past (for today)
    const isTimeSlotDisabled = (slot) => {
        if (!selectedDate) return false;

        const now = new Date();
        const slotDate = slot instanceof Date ? new Date(slot) : new Date(slot);

        // If the selected date is today, disable past time slots
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);

        if (selectedDateOnly.getTime() === today.getTime()) {
            // For today, disable slots that are in the past
            return slotDate <= now;
        }

        return false;
    };

    const formatTime = (time) => {
        try {
            // Handle Date objects
            let dateObj;
            if (time instanceof Date) {
                dateObj = time;
            } else if (typeof time === 'string') {
                // If it's a string, try to parse it
                dateObj = new Date(time);
            } else {
                // Fallback
                return String(time);
            }

            if (formatMode === '12h') {
                // Format as "12:00 am", "12:15 am", etc. (lowercase am/pm)
                return format(dateObj, 'h:mm a').toLowerCase();
            } else {
                // Format as "00:00", "00:15", etc. (24-hour format)
                return format(dateObj, 'HH:mm');
            }
        } catch (error) {
            return String(time);
        }
    };

    // Get the selected date for header display
    const getHeaderText = () => {
        if (selectedDate) {
            const dateObj = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
            return format(dateObj, 'EEE dd');
        }
        return 'Select time';
    };

    // Check if a time slot is selected (compare Date objects properly)
    const isTimeSelected = (slot) => {
        if (!selectedTime) return false;
        if (slot instanceof Date && selectedTime instanceof Date) {
            return slot.getTime() === selectedTime.getTime();
        }
        return slot === selectedTime;
    };

    return (
        <div className={cn("flex flex-col", className)}>
            {/* Header with time format toggle */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">
                    {getHeaderText()}
                </h3>
                <div className="flex gap-1 bg-zinc-800 rounded-md p-1">
                    <button
                        onClick={() => setFormatMode('12h')}
                        className={cn(
                            "px-2 py-1 text-xs rounded transition-colors",
                            formatMode === '12h'
                                ? "bg-white text-black"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        12h
                    </button>
                    <button
                        onClick={() => setFormatMode('24h')}
                        className={cn(
                            "px-2 py-1 text-xs rounded transition-colors",
                            formatMode === '24h'
                                ? "bg-white text-black"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        24h
                    </button>
                </div>
            </div>

            {/* Time slots list */}
            <div className="space-y-1 max-h-96 overflow-y-auto">
                {timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-sm">
                        {selectedDate ? 'No available time slots for this date' : 'Select a date to see available times'}
                    </div>
                ) : (
                    timeSlots.map((slot, index) => {
                        const isSelected = isTimeSelected(slot);
                        const isDisabled = isTimeSlotDisabled(slot);
                        // Create a unique key for each slot
                        const slotKey = slot instanceof Date ? slot.toISOString() : `${slot}-${index}`;

                        return (
                            <button
                                key={slotKey}
                                onClick={() => !isDisabled && onSelect && onSelect(slot)}
                                disabled={isDisabled}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                                    isDisabled && "opacity-50 cursor-not-allowed",
                                    isSelected && !isDisabled
                                        ? "bg-white text-black hover:bg-zinc-100 border border-white"
                                        : !isDisabled && "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                                    isDisabled && "text-zinc-600"
                                )}
                            >
                                {/* Green dot indicator */}
                                <div className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    isSelected ? "bg-black" : isDisabled ? "bg-zinc-600" : "bg-green-500"
                                )} />
                                <span className="font-medium">{formatTime(slot)}</span>
                                {isDisabled && (
                                    <span className="ml-auto text-xs text-zinc-500">Past</span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

