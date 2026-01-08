'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { fetchBookingById, cancelBooking } from '@/lib/api/bookings';
import { transformBookingFromAPI } from '@/lib/utils/bookings';
import { format } from 'date-fns';

export default function BookingDetailPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBooking = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchBookingById(id);
                const transformedBooking = transformBookingFromAPI(data);
                setBooking(transformedBooking);
            } catch (err) {
                console.error('Failed to load booking:', err);
                setError(err.message || 'Failed to load booking');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadBooking();
        }
    }, [id]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await cancelBooking(booking.id);
            // Reload booking to reflect the change
            const data = await fetchBookingById(id);
            const transformedBooking = transformBookingFromAPI(data);
            setBooking(transformedBooking);
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            alert(err.message || 'Failed to cancel booking');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <div className="flex-1 p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-zinc-400">Loading booking...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <div className="flex-1 p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white mb-2">Booking Not Found</h1>
                        <p className="text-zinc-400 mb-4">{error || 'The booking you are looking for does not exist.'}</p>
                        <Link
                            href="/bookings"
                            className="inline-block px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                        >
                            Back to Bookings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const formatDateTime = (date) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'EEEE, MMMM d, yyyy');
        } catch {
            return '';
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'h:mmaaa').toLowerCase();
        } catch {
            return '';
        }
    };

    const formatTimeRange = () => {
        if (!booking.startTime || !booking.endTime) return '';
        return `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`;
    };

    const generateCalendarLink = (type) => {
        const start = new Date(booking.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(booking.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const title = encodeURIComponent(booking.eventName);
        const location = encodeURIComponent(booking.location);

        switch (type) {
            case 'google':
                return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
            case 'outlook':
                return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&location=${location}`;
            case 'ics':
                const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cal.com//Cal.com Calendar//EN
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${booking.eventName}
LOCATION:${booking.location}
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
        link.download = `${booking.eventName}-${format(new Date(booking.startTime), 'yyyy-MM-dd')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />
            <div className="flex-1 p-8">
                {/* Back to bookings link */}
                <div className="mb-6">
                    <Link href="/bookings" className="flex items-center gap-2 text-white hover:text-zinc-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to bookings</span>
                    </Link>
                </div>

                {/* Main content */}
                <div className="max-w-2xl">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
                        {/* Success icon and heading */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">This meeting is scheduled</h1>
                            <p className="text-zinc-400">
                                We sent an email with a calendar invitation with the details to everyone.
                            </p>
                        </div>

                        {/* Meeting details */}
                        <div className="space-y-6 mb-8">
                            {/* What */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-400 mb-2">What</h3>
                                <p className="text-white">{booking.eventName}</p>
                            </div>

                            {/* When */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-400 mb-2">When</h3>
                                <p className="text-white">{formatDateTime(booking.startTime)}</p>
                                <p className="text-zinc-400 text-sm">{formatTimeRange()} ({booking.timezone})</p>
                            </div>

                            {/* Who */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Who</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{booking.hostName}</span>
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Host</span>
                                        <span className="text-zinc-400 text-sm">{booking.hostEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{booking.clientName}</span>
                                        <span className="text-zinc-400 text-sm">{booking.clientEmail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Where */}
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-400 mb-2">Where</h3>
                                <a
                                    href={booking.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
                                >
                                    <span>{booking.location}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Need to make a change */}
                        {booking.status !== 'cancelled' && (
                            <div className="mb-8">
                                <p className="text-sm text-zinc-400 mb-3">Need to make a change?</p>
                                <div className="flex gap-4">
                                    <button className="text-white hover:text-orange-500 transition-colors">
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="text-white hover:text-red-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add to calendar */}
                        <div className="mb-8">
                            <div className="flex gap-4">
                                <a
                                    href={generateCalendarLink('google')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                    title="Google Calendar"
                                >
                                    <span className="text-white font-bold text-sm">G</span>
                                </a>
                                <a
                                    href={generateCalendarLink('outlook')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                                    title="Outlook Calendar"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </a>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

