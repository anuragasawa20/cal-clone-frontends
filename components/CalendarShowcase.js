'use client';

import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

export default function CalendarShowcase() {
    const [selectedDate, setSelectedDate] = useState(null);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    Calendar Component
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Select a date to see it in action
                </p>
            </div>

            <Calendar
                selected={selectedDate}
                onSelect={setSelectedDate}
            />

            {selectedDate && (
                <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Selected date:
                    </p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                </div>
            )}
        </div>
    );
}

