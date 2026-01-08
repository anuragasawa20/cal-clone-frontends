'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchBookingById } from '@/lib/api/bookings';
import { transformBookingFromAPI } from '@/lib/utils/bookings';
import { format } from 'date-fns';

export default function BookingConfirmationPage({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBooking = async () => {
            const bookingId = searchParams.get('id');
            if (!bookingId) {
                setError('Booking ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await fetchBookingById(bookingId);
                const transformedBooking = transformBookingFromAPI(data);
                setBooking(transformedBooking);
            } catch (err) {
                console.error('Failed to load booking:', err);
                setError(err.message || 'Failed to load booking');
            } finally {
                setLoading(false);
            }
        };

        loadBooking();
    }, [searchParams]);

    const formatDateTime = (date) => {
        if (!date) return '';
        try {
            return format(date, 'EEEE, MMMM d, yyyy');
        } catch {
            return '';
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        try {
            return format(date, 'h:mmaaa').toLowerCase();
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading booking confirmation...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
                    <p className="text-zinc-400 mb-4">{error || 'The booking you are looking for does not exist.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const eventType = booking.eventType || {};
    const formatTimeRange = () => {
        if (!booking.startTime || !booking.endTime) return '';
        const start = booking.startTime ? new Date(booking.startTime) : null;
        const end = booking.endTime ? new Date(booking.endTime) : null;
        if (!start || !end) return '';
        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const generateCalendarLink = (type) => {
        const start = booking.startTime ? new Date(booking.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
        const end = booking.endTime ? new Date(booking.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
        const title = encodeURIComponent(eventType.name || 'Meeting');
        const description = encodeURIComponent(eventType.description || '');
        const location = encodeURIComponent(booking.location || 'Cal Video');

        switch (type) {
            case 'google':
                return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`;
            case 'outlook':
                return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`;
            case 'ics':
                const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cal.com//Cal.com Calendar//EN
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${eventType.name || 'Meeting'}
DESCRIPTION:${eventType.description || ''}
LOCATION:${booking.location || 'Cal Video'}
END:VEVENT
END:VCALENDAR`;
                const blob = new Blob([icsContent], { type: 'text/calendar' });
                return URL.createObjectURL(blob);
            default:
                return '#';
        }
    };

    const handleDownloadICS = () => {
        const link = document.createElement('a');
        link.href = generateCalendarLink('ics');
        const startDate = booking.startTime ? new Date(booking.startTime) : new Date();
        link.download = `${eventType.name || 'Meeting'}-${format(startDate, 'yyyy-MM-dd')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Main Content - Centered like other public pages */}
            <div className="max-w-2xl mx-auto px-8 py-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">

                    {/* Success Icon & Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">This meeting is scheduled</h1>
                        <p className="text-zinc-400">
                            We sent an email with a calendar invitation with the details to everyone.
                        </p>
                    </div>

                    <div className="border-t border-zinc-800/50 my-8"></div>

                    {/* Meeting Details */}
                    <div className="space-y-6 mb-8">
                        {/* What */}
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <h3 className="text-sm font-medium text-zinc-400">What</h3>
                            <p className="text-zinc-100 font-medium">{eventType.name || 'Meeting'} between {booking.hostName || 'Host'} and {booking.clientName || booking.name}</p>
                        </div>

                        {/* When */}
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <h3 className="text-sm font-medium text-zinc-400">When</h3>
                            <div>
                                {booking.startTime && (
                                    <>
                                        <p className="text-zinc-100 font-medium">{formatDateTime(new Date(booking.startTime))}</p>
                                        <p className="text-zinc-500 text-sm mt-0.5">{formatTimeRange()} ({booking.timezone || 'UTC'})</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Who */}
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <h3 className="text-sm font-medium text-zinc-400">Who</h3>
                            <div className="space-y-4">
                                {/* Host */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-zinc-100 font-medium">{booking.hostName || 'Host'}</span>
                                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider rounded">Host</span>
                                    </div>
                                    {booking.hostEmail && (
                                        <p className="text-zinc-500 text-sm">{booking.hostEmail}</p>
                                    )}
                                </div>
                                {/* Guest */}
                                <div className="flex flex-col">
                                    <span className="text-zinc-100 font-medium mb-0.5">{booking.clientName || booking.name}</span>
                                    <p className="text-zinc-500 text-sm">{booking.clientEmail}</p>
                                </div>
                            </div>
                        </div>

                        {/* Where */}
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                            <h3 className="text-sm font-medium text-zinc-400">Where</h3>
                            <a
                                href={booking.locationUrl || booking.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-zinc-100 hover:underline decoration-zinc-500 underline-offset-4 transition-all"
                            >
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{booking.location || 'Cal Video'}</span>
                            </a>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800/50 my-8"></div>

                    {/* Actions Row */}
                    <div className="flex flex-row sm:flex-row sm:items-center justify-between gap-6">

                        {/* Reschedule Links */}
                        <div className="text-sm">
                            <span className="text-zinc-400">Need to make a change? </span>
                            <div className="inline-block space-x-1 mt-1 sm:mt-0">
                                <button className="text-zinc-200 hover:text-white underline underline-offset-2 transition-colors">Reschedule</button>
                                <span className="text-zinc-600">or</span>
                                <button className="text-zinc-200 hover:text-white underline underline-offset-2 transition-colors">Cancel</button>
                            </div>
                        </div>

                        {/* Calendar Buttons */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-zinc-400 hidden sm:block">Add to calendar</span>
                            <div className="flex gap-2">
                                <a
                                    href={generateCalendarLink('google')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-all"
                                    title="Google Calendar"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.04-1.133 8.16-3.293 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.12H12.48z" /></svg>
                                </a>
                                <a
                                    href={generateCalendarLink('outlook')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-all"
                                    title="Outlook Calendar"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1 7l9 5 9-5-9-5-9 5zm9 34l-9-5v-14l9 5v14zm2-14l9-5v14l-9 5v-14z" /></svg>
                                </a>
                                <button
                                    onClick={handleDownloadICS}
                                    className="w-9 h-9 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-all"
                                    title="Download .ics"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="mt-8 p-4 rounded-md bg-orange-500/10 border border-orange-500/20 flex gap-3 items-start">
                        <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm">
                            <p className="text-orange-200">
                                Google&apos;s new spam policy could prevent you from receiving any email and calendar notifications about this booking.
                            </p>
                            <button className="text-orange-400 hover:text-orange-300 underline underline-offset-2 mt-1 font-medium transition-colors">
                                Resolve
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}