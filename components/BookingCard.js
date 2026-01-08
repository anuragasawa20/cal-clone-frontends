'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BookingCard({
    booking,
    onCancel,
    onReschedule,
    onJoin,
    className
}) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const formatDate = (date) => {
        try {
            const d = new Date(date);
            return format(d, 'EEE, d MMM');
        } catch {
            return date;
        }
    };

    const formatTime = (date) => {
        try {
            const d = new Date(date);
            return format(d, 'h:mmaaa').toLowerCase();
        } catch {
            return date;
        }
    };

    const isPast = booking.status === 'past' || (booking.endTime && new Date(booking.endTime) < new Date());

    const handleCardClick = (e) => {
        // Don't navigate if clicking on action buttons or links
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        router.push(`/bookings/${booking.id}`);
    };

    return (
        <div
            className={cn("bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer", className)}
            onClick={handleCardClick}
        >
            <div className="flex items-start justify-between gap-6">
                {/* First Column: Date, Time, Join Cal Video */}
                <div className="flex flex-col gap-2 min-w-0">
                    {/* Date */}
                    <div className="text-sm font-medium text-white">
                        {formatDate(booking.date || booking.startTime)}
                    </div>

                    {/* Time */}
                    <div className="text-sm text-zinc-400">
                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </div>

                    {/* Join Cal Video */}
                    {booking.meetingLink && (
                        <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onJoin) {
                                    e.preventDefault();
                                    onJoin(booking);
                                }
                            }}
                            className="inline-flex items-center gap-2 text-sm text-white hover:text-orange-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Cal Video
                        </a>
                    )}
                </div>

                {/* Second Column: Event Name and Participants */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-400 mb-1">
                        {booking.eventName || booking.description || 'Meeting'}
                    </div>
                    <div className="text-sm text-zinc-500">
                        {booking.participants || `You and ${booking.clientName || booking.name}`}
                    </div>
                </div>

                {/* Right side - Actions menu */}
                <div className="relative shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                }}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-20">
                                <div className="py-1">
                                    {!isPast && onReschedule && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReschedule(booking);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                                        >
                                            Reschedule
                                        </button>
                                    )}
                                    {!isPast && onCancel && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to cancel this booking?')) {
                                                    onCancel(booking);
                                                }
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

