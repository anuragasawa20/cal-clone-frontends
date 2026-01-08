'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import TimeSelect from './TimeSelect';

export default function TimeRangeInput({
    startTime,
    endTime,
    onChange,
    disabled = false,
    className
}) {
    const [internalStart, setInternalStart] = useState(startTime || '09:00');
    const [internalEnd, setInternalEnd] = useState(endTime || '17:00');

    // Update internal state when props change
    const startValue = startTime !== undefined ? startTime : internalStart;
    const endValue = endTime !== undefined ? endTime : internalEnd;

    const handleStartChange = (value) => {
        setInternalStart(value);
        if (onChange) {
            onChange({ startTime: value, endTime: endValue });
        }
    };

    const handleEndChange = (value) => {
        setInternalEnd(value);
        if (onChange) {
            onChange({ startTime: startValue, endTime: value });
        }
    };

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <TimeSelect
                value={startValue}
                onChange={handleStartChange}
                disabled={disabled}
            />
            <span className="text-zinc-400 text-sm">–</span>
            <TimeSelect
                value={endValue}
                onChange={handleEndChange}
                disabled={disabled}
            />
        </div>
    );
}

