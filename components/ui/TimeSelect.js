'use client';

import { useState, useRef, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

// Generate 15-minute intervals for a full day
const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const time = new Date();
            time.setHours(hour, minute, 0, 0);
            const value = format(time, 'HH:mm');
            const display = format(time, 'h:mm aaa').toLowerCase();
            options.push({ value, display });
        }
    }
    return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function TimeSelect({
    value,
    onChange,
    disabled = false,
    className
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Convert value to display format
    const formatTimeForDisplay = (time) => {
        if (!time) return '';
        try {
            // Handle HH:mm format
            if (time.match(/^\d{2}:\d{2}$/)) {
                const parsed = parse(time, 'HH:mm', new Date());
                if (isValid(parsed)) {
                    return format(parsed, 'h:mm aaa').toLowerCase();
                }
            }
            // Handle formats with am/pm
            if (time.includes('am') || time.includes('pm')) {
                const parsed = parse(time.toLowerCase(), 'h:mmaaa', new Date());
                if (isValid(parsed)) {
                    return format(parsed, 'h:mm aaa').toLowerCase();
                }
            }
        } catch (error) {
            // Return as is if parsing fails
        }
        return time;
    };

    // Convert display value to HH:mm format
    const formatTimeForValue = (display) => {
        try {
            const parsed = parse(display.toLowerCase(), 'h:mmaaa', new Date());
            if (isValid(parsed)) {
                return format(parsed, 'HH:mm');
            }
        } catch (error) {
            // Return as is if parsing fails
        }
        return display;
    };

    const selectedOption = TIME_OPTIONS.find(opt => opt.value === value) ||
        (value ? { value, display: formatTimeForDisplay(value) } : TIME_OPTIONS[0]);

    const handleSelect = (option) => {
        onChange && onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "px-3 py-1.5 bg-[#101010] border border-[#2E2E2E] rounded text-white text-sm text-left whitespace-nowrap",
                    "focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "w-24 hover:bg-[#1C1C1C] transition-colors",
                    !disabled && "cursor-pointer"
                )}
            >
                {selectedOption.display}
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-64 overflow-y-auto">
                    {TIME_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className={cn(
                                "w-full text-left px-4 py-2.5 text-sm transition-colors whitespace-nowrap",
                                value === option.value
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                            )}
                        >
                            {option.display}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

