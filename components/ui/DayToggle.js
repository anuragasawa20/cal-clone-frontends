'use client';

import { cn } from '@/lib/utils';

const dayLabels = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
};

export default function DayToggle({
    day,
    enabled,
    onToggle,
    label,
    className
}) {
    const dayName = label || dayLabels[day] || `Day ${day}`;

    return (
        <div className={cn("flex items-center justify-between py-3", className)}>
            <span className="text-sm font-medium text-white">{dayName}</span>
            <button
                type="button"
                onClick={() => onToggle && onToggle(!enabled)}
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black",
                    enabled ? "bg-orange-500" : "bg-zinc-700"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        enabled ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </button>
        </div>
    );
}

