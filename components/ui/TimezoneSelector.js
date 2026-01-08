'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Common timezones list
const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'Mumbai, Kolkata (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
    { value: 'America/Toronto', label: 'Toronto (EST)' },
    { value: 'America/Vancouver', label: 'Vancouver (PST)' },
    { value: 'America/Mexico_City', label: 'Mexico City (CST)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)' },
];

export default function TimezoneSelector({
    value,
    onChange,
    label = 'Timezone',
    className
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredTimezones = timezones.filter(tz =>
        tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedTimezone = timezones.find(tz => tz.value === value) || timezones[0];

    const handleSelect = (tz) => {
        onChange && onChange(tz.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm hover:bg-zinc-700 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M3.055 11H1m2.055 0a9.97 9.97 0 0113.89 0M21 11h-2.945M21 11H23m-2.945 0a9.97 9.97 0 00-13.89 0M9 8a3 3 0 110-6 3 3 0 010 6z" />
                    </svg>
                    <span>{selectedTimezone.label}</span>
                </div>
                <svg
                    className={cn(
                        "w-4 h-4 text-zinc-400 transition-transform",
                        isOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-64 overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-zinc-700">
                        <input
                            type="text"
                            placeholder="Search timezone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                        />
                    </div>

                    {/* Timezone list */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredTimezones.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-zinc-400 text-center">
                                No timezones found
                            </div>
                        ) : (
                            filteredTimezones.map((tz) => (
                                <button
                                    key={tz.value}
                                    type="button"
                                    onClick={() => handleSelect(tz)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm transition-colors",
                                        value === tz.value
                                            ? "bg-zinc-700 text-white"
                                            : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                                    )}
                                >
                                    {tz.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

