'use client';

import { DAYS } from '@/constants/availability';
import AvailabilityDayRow from './AvailabilityDayRow';

export default function AvailabilitySchedule({
    availability,
    onDayToggle,
    onTimeRangeChange,
    onAddTimeRange,
    onRemoveTimeRange,
    onCopyDay
}) {
    return (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg overflow-hidden mb-8">
            {DAYS.map((day, index) => {
                const dayAvailability = availability[day.value];
                const isLast = index === DAYS.length - 1;

                return (
                    <AvailabilityDayRow
                        key={day.value}
                        day={day}
                        dayAvailability={dayAvailability}
                        isLast={isLast}
                        onToggle={() => onDayToggle(day.value)}
                        onTimeRangeChange={onTimeRangeChange}
                        onAddTimeRange={onAddTimeRange}
                        onRemoveTimeRange={onRemoveTimeRange}
                        onCopyDay={onCopyDay}
                    />
                );
            })}
        </div>
    );
}

