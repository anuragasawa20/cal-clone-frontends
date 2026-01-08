'use client';

import TimeRangeInput from '@/components/ui/TimeRangeInput';

export default function AvailabilityDayRow({
    day,
    dayAvailability,
    isLast,
    onToggle,
    onTimeRangeChange,
    onAddTimeRange,
    onRemoveTimeRange,
    onCopyDay
}) {
    return (
        <div
            className={`flex items-center gap-4 px-4 py-3 ${!isLast ? 'border-b border-[#2E2E2E]' : ''}`}
        >
            {/* Toggle */}
            <div className="w-12 shrink-0">
                <button
                    onClick={onToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dayAvailability?.enabled ? 'bg-white' : 'bg-[#2E2E2E]'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${dayAvailability?.enabled
                            ? 'translate-x-6 bg-black'
                            : 'translate-x-1 bg-zinc-400'
                            }`}
                    />
                </button>
            </div>

            {/* Day Name */}
            <div className="w-24 shrink-0">
                <span
                    className={`text-sm font-medium ${dayAvailability?.enabled ? 'text-white' : 'text-zinc-500'
                        }`}
                >
                    {day.label}
                </span>
            </div>

            {/* Time Ranges */}
            {dayAvailability?.enabled && (
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                    {dayAvailability.timeRanges.map((range, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <TimeRangeInput
                                startTime={range.startTime}
                                endTime={range.endTime}
                                onChange={(newRange) => onTimeRangeChange(day.value, idx, newRange)}
                                disabled={!dayAvailability.enabled}
                            />
                            {dayAvailability.timeRanges.length > 1 && (
                                <button
                                    onClick={() => onRemoveTimeRange(day.value, idx)}
                                    className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={() => onAddTimeRange(day.value)}
                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        title="Add time slot"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onCopyDay(day.value)}
                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                        title="Copy to other days"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

