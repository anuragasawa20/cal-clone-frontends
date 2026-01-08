'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import FilterTabs from '@/components/ui/FilterTabs';
import BookingCard from '@/components/BookingCard';
import { fetchBookings, cancelBooking } from '@/lib/api/bookings';
import { transformBookingsFromAPI } from '@/lib/utils/bookings';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

const FILTER_TABS = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'unconfirmed', label: 'Unconfirmed' },
    { value: 'recurring', label: 'Recurring' },
    { value: 'past', label: 'Past' },
    { value: 'canceled', label: 'Canceled' }
];

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchBookings();
            const transformedBookings = transformBookingsFromAPI(data);
            setBookings(transformedBookings);
        } catch (err) {
            console.error('Failed to load bookings:', err);
            setError(err.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = (bookings, filter) => {
        const now = new Date();
        // Set to start of current minute to avoid time precision issues
        now.setSeconds(0, 0);

        switch (filter) {
            case 'upcoming':
                return bookings.filter(b => {
                    if (b.status === 'cancelled') return false;
                    const startTime = b.startTime ? new Date(b.startTime) : null;
                    if (!startTime) return false;
                    // Only show bookings that are in the future (after current time)
                    return startTime > now;
                });
            case 'past':
                return bookings.filter(b => {
                    if (b.status === 'cancelled') return false;
                    const startTime = b.startTime ? new Date(b.startTime) : null;
                    if (!startTime) return false;
                    // Only show bookings that are in the past (before current time)
                    return startTime < now;
                });
            case 'canceled':
                return bookings.filter(b => b.status === 'cancelled');
            case 'unconfirmed':
                return bookings.filter(b => {
                    // Only show unconfirmed bookings that are in the future
                    const startTime = b.startTime ? new Date(b.startTime) : null;
                    return (b.status === 'pending' || b.status === 'unconfirmed') &&
                        startTime && startTime > now;
                });
            case 'recurring':
                return bookings.filter(b => b.recurring === true);
            default:
                return bookings;
        }
    };

    const groupBookingsByDate = (bookings) => {
        const groups = {
            today: [],
            tomorrow: [],
            next: [],
            other: []
        };

        const now = new Date();
        now.setSeconds(0, 0);

        bookings.forEach(booking => {
            if (!booking.startTime) return;

            const bookingDate = new Date(booking.startTime);

            // Only group bookings that are in the future (for upcoming tab)
            // For past tab, this will already be filtered, so we can safely group
            if (isToday(bookingDate)) {
                groups.today.push(booking);
            } else if (isTomorrow(bookingDate)) {
                groups.tomorrow.push(booking);
            } else if (bookingDate > now) {
                // Future bookings
                groups.next.push(booking);
            } else {
                // Past bookings (only shown in "past" tab)
                groups.other.push(booking);
            }
        });

        return groups;
    };

    const filteredBookings = filterBookings(bookings, activeTab);
    const groupedBookings = groupBookingsByDate(filteredBookings);

    const handleCancel = async (booking) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await cancelBooking(booking.id);
            // Reload bookings to reflect the change
            await loadBookings();
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            alert(err.message || 'Failed to cancel booking');
        }
    };

    const handleReschedule = (booking) => {
        console.log('Reschedule booking:', booking.id);
        // TODO: Navigate to reschedule flow
        alert('Reschedule booking! (Backend integration pending)');
    };

    const handleJoin = (booking) => {
        if (booking.meetingLink) {
            window.open(booking.meetingLink, '_blank');
        }
    };

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-white mb-1">Bookings</h1>
                    <p className="text-zinc-400 text-sm">
                        See upcoming and past events booked through your event type links.
                    </p>
                </div>

                {/* Filter tabs and actions */}
                <div className="flex items-center justify-between mb-6">
                    <FilterTabs
                        tabs={FILTER_TABS}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-700 rounded-md text-white text-sm hover:bg-zinc-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-700 rounded-md text-white text-sm hover:bg-zinc-800 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Saved
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Bookings table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                            <p className="text-zinc-400">Loading bookings...</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={loadBookings}
                                    className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="p-12">
                            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-300 mb-2">
                                    {activeTab === 'unconfirmed' && 'No unconfirmed bookings'}
                                    {activeTab === 'recurring' && 'No recurring bookings'}
                                    {activeTab === 'past' && 'No past bookings'}
                                    {activeTab === 'canceled' && 'No canceled bookings'}
                                    {activeTab === 'upcoming' && 'No upcoming bookings'}
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    {activeTab === 'unconfirmed' && 'You have no unconfirmed bookings. Your unconfirmed bookings will show up here.'}
                                    {activeTab === 'recurring' && 'You have no recurring bookings. Your recurring bookings will show up here.'}
                                    {activeTab === 'past' && 'You have no past bookings. Your past bookings will show up here.'}
                                    {activeTab === 'canceled' && 'You have no canceled bookings. Your canceled bookings will show up here.'}
                                    {activeTab === 'upcoming' && 'You have no upcoming bookings. Your upcoming bookings will show up here.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-zinc-800">
                                {/* TODAY section */}
                                {groupedBookings.today.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-0 px-4 pt-4 pb-2 uppercase">Today</h2>
                                        <div className="divide-y divide-zinc-800">
                                            {groupedBookings.today.map(booking => (
                                                <div key={booking.id} className="px-4">
                                                    <BookingCard
                                                        booking={booking}
                                                        onCancel={handleCancel}
                                                        onReschedule={handleReschedule}
                                                        onJoin={handleJoin}
                                                        className="border-0 rounded-none bg-transparent hover:bg-zinc-800/30"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TOMORROW section */}
                                {groupedBookings.tomorrow.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-0 px-4 pt-4 pb-2 uppercase">Tomorrow</h2>
                                        <div className="divide-y divide-zinc-800">
                                            {groupedBookings.tomorrow.map(booking => (
                                                <div key={booking.id} className="px-4">
                                                    <BookingCard
                                                        booking={booking}
                                                        onCancel={handleCancel}
                                                        onReschedule={handleReschedule}
                                                        onJoin={handleJoin}
                                                        className="border-0 rounded-none bg-transparent hover:bg-zinc-800/30"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* NEXT section */}
                                {groupedBookings.next.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-0 px-4 pt-4 pb-2 uppercase">Next</h2>
                                        <div className="divide-y divide-zinc-800">
                                            {groupedBookings.next.map(booking => (
                                                <div key={booking.id} className="px-4">
                                                    <BookingCard
                                                        booking={booking}
                                                        onCancel={handleCancel}
                                                        onReschedule={handleReschedule}
                                                        onJoin={handleJoin}
                                                        className="border-0 rounded-none bg-transparent hover:bg-zinc-800/30"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* OTHER section (past bookings) - only show in "past" tab */}
                                {activeTab === 'past' && groupedBookings.other.length > 0 && (
                                    <div>
                                        <h2 className="text-sm font-semibold text-zinc-400 mb-0 px-4 pt-4 pb-2 uppercase">Past</h2>
                                        <div className="divide-y divide-zinc-800">
                                            {groupedBookings.other.map(booking => (
                                                <div key={booking.id} className="px-4">
                                                    <BookingCard
                                                        booking={{ ...booking, status: 'past' }}
                                                        onCancel={handleCancel}
                                                        onReschedule={handleReschedule}
                                                        onJoin={handleJoin}
                                                        className="border-0 rounded-none bg-transparent hover:bg-zinc-800/30"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination inside table */}
                            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-zinc-400">Rows per page:</span>
                                    <select className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-white text-sm">
                                        <option>10</option>
                                        <option>20</option>
                                        <option>50</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-zinc-400">
                                        1-{filteredBookings.length} of {filteredBookings.length}
                                    </span>
                                    <button className="p-2 text-zinc-400 hover:text-white disabled:opacity-50" disabled>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button className="p-2 text-zinc-400 hover:text-white disabled:opacity-50" disabled>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

