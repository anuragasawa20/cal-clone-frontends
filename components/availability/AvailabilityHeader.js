'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSummaryText } from '@/lib/utils/availability';

export default function AvailabilityHeader({ title, availability, onTitleChange }) {
    const router = useRouter();
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (localTitle !== title) {
            onTitleChange(localTitle);
        }
    };

    const handleTitleKeyPress = (e) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
            if (localTitle !== title) {
                onTitleChange(localTitle);
            }
        }
    };

    const summaryLines = getSummaryText(availability);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/availability')}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyPress={handleTitleKeyPress}
                            className="text-2xl font-semibold text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-white rounded px-2"
                            autoFocus
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold text-white">{title}</h1>
                            <button
                                onClick={() => setIsEditingTitle(true)}
                                className="p-1 text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-1 ml-10">
                {summaryLines.map((line, idx) => (
                    <p key={idx} className="text-sm text-gray-500">{line}</p>
                ))}
            </div>
        </div>
    );
}

