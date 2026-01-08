'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import TimeSlotPicker from '@/components/ui/TimeSlotPicker';
import TimezoneSelector from '@/components/ui/TimezoneSelector';
import { fetchEventTypeBySlug } from '@/lib/api/eventTypes';
import { fetchAvailabilityById, fetchDefaultAvailability } from '@/lib/api/availability';
import { fetchBookings } from '@/lib/api/bookings';
import { generateTimeSlotsFromAvailability, filterBookedSlots, hasAvailabilityForDay } from '@/lib/utils/timeSlots';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

export default function PublicBookingPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [timeFormat, setTimeFormat] = useState('12h');
    const [eventType, setEventType] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [existingBookings, setExistingBookings] = useState([]);
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

    useEffect(() => {
        // Generate available dates starting from today (not past dates)
        const dates = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        // Generate dates for the next 30 days (starting from today)
        for (let i = 0; i < 30; i++) {
            dates.push(addDays(today, i));
        }
        setAvailableDates(dates);
    }, []);

    useEffect(() => {
        const loadEventType = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchEventTypeBySlug(slug);
                setEventType(data);

                // 3-tier availability priority system:
                // 1. Event-specific availability (event.availability_id)
                // 2. Default availability (first/default availability in system)
                // 3. Fallback: No availability (will show no slots, all days disabled)

                if (data && data.availability_id) {
                    // Tier 1: Try to load event-specific availability
                    try {
                        const availabilityData = await fetchAvailabilityById(data.availability_id);
                        if (availabilityData && availabilityData.intervals && availabilityData.intervals.length > 0) {
                            setAvailability(availabilityData);
                        } else {
                            // Event has availability_id but no intervals, fallback to default
                            throw new Error('Event availability has no intervals');
                        }
                    } catch (availErr) {
                        console.error('Failed to load event-specific availability:', availErr);
                        // Tier 2: Fallback to default availability
                        try {
                            const defaultAvail = await fetchDefaultAvailability();
                            if (defaultAvail) {
                                setAvailability(defaultAvail);
                            }
                            // Tier 3: If no default availability exists, availability remains null
                            // This will result in all days being disabled
                        } catch (defaultErr) {
                            console.error('Failed to load default availability:', defaultErr);
                            // Tier 3: No availability - will show no slots, all days disabled
                        }
                    }
                } else {
                    // No availability_id on event, try to get default availability (Tier 2)
                    try {
                        const defaultAvail = await fetchDefaultAvailability();
                        if (defaultAvail) {
                            setAvailability(defaultAvail);
                        }
                        // Tier 3: If no default availability exists, availability remains null
                    } catch (defaultErr) {
                        console.error('Failed to load default availability:', defaultErr);
                        // Tier 3: No availability - will show no slots, all days disabled
                    }
                }
            } catch (err) {
                console.error('Failed to load event type:', err);
                setError(err.message || 'Failed to load event type');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadEventType();
        }
    }, [slug]);

    // Load existing bookings when date is selected
    useEffect(() => {
        const loadBookings = async () => {
            if (!selectedDate || !eventType) return;

            try {
                setLoadingTimeSlots(true);
                // Fetch bookings for this event type and date
                // Format date in local timezone to avoid timezone conversion issues
                // If we use toISOString(), Jan 9 IST becomes Jan 8 UTC
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                const bookings = await fetchBookings({
                    event_type_id: eventType.id,
                    date: dateStr,
                    booking_status: 'confirmed' // Only get confirmed bookings
                });
                setExistingBookings(bookings || []);
            } catch (err) {
                console.error('Failed to load bookings:', err);
                setExistingBookings([]);
            } finally {
                setLoadingTimeSlots(false);
            }
        };

        loadBookings();
    }, [selectedDate, eventType]);

    const handleDateSelect = (date) => {
        // Prevent selecting past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(date);
        selectedDateOnly.setHours(0, 0, 0, 0);

        if (selectedDateOnly < today) {
            // Don't allow past dates
            return;
        }

        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeSelect = (time) => {
        if (!selectedDate) return;

        // Validate that the selected time is not in the past
        const now = new Date();
        const selectedDateTime = time instanceof Date ? new Date(time) : new Date(time);

        if (isSameDay(selectedDate, now)) {
            // If selecting for today, ensure time is in the future
            if (selectedDateTime <= now) {
                alert('Cannot select past times. Please select a future time.');
                return;
            }
        }

        setSelectedTime(time);
        // Navigate to form page with selected date and time
        const timeStr = time instanceof Date ? time.toISOString() : time;
        router.push(`/book/${slug}/form?date=${selectedDate.toISOString()}&time=${encodeURIComponent(timeStr)}`);
    };

    // Generate time slots from availability
    const generateTimeSlots = () => {
        if (!selectedDate || !availability || !eventType) {
            return [];
        }

        const now = new Date();
        const duration = eventType.duration || 30;

        // Generate slots from availability intervals
        let slots = generateTimeSlotsFromAvailability(availability, selectedDate, duration, now);

        // Filter out already booked slots
        slots = filterBookedSlots(slots, existingBookings, duration);

        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading event...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !eventType) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
                    <p className="text-zinc-400 mb-4">{error || 'The event you are looking for does not exist.'}</p>
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

    // Default values for fields that might not exist
    const hostName = eventType.hostName || 'Host';
    const location = eventType.location || 'Cal Video';
    const timezone = eventType.timezone || 'UTC';

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-end p-4 gap-4">
                <button className="text-white text-sm hover:text-zinc-300 transition-colors">
                    Need help?
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
                <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>
            </div>

            {/* Main content - Unified card layout */}
            <div className="flex-1 flex items-center justify-center px-8 py-8">
                <div className="w-full max-w-7xl">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-[280px_1.75fr_0.9fr] divide-x divide-zinc-800">
                            {/* Left Panel - Event Details */}
                            <div className="p-6 flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                                        {hostName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-white font-semibold">{hostName}</h2>
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold text-white mb-2">{eventType.name}</h1>
                                {eventType.description && (
                                    <p className="text-zinc-400 mb-6">{eventType.description}</p>
                                )}

                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{eventType.duration} minutes</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{location}</span>
                                    </div>
                                </div>

                                {/* Timezone Selector */}
                                <div className="mt-auto">
                                    <TimezoneSelector
                                        value={timezone}
                                        onChange={(tz) => {
                                            // Handle timezone change if needed in future
                                            console.log('Timezone changed to:', tz);
                                        }}
                                        label=""
                                    />
                                </div>
                            </div>

                            {/* Middle Panel - Calendar */}
                            <div className="p-6">
                                <Calendar
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    availableDates={availableDates}
                                    disabled={(date) => {
                                        // Disable past dates
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const dateToCheck = new Date(date);
                                        dateToCheck.setHours(0, 0, 0, 0);

                                        if (dateToCheck < today) {
                                            return true; // Disable past dates
                                        }

                                        // Disable dates whose day-of-week has no availability intervals
                                        if (availability) {
                                            const dayOfWeek = dateToCheck.getDay(); // 0-6 (Sunday = 0)
                                            return !hasAvailabilityForDay(availability, dayOfWeek);
                                        }

                                        // If no availability loaded, disable all dates
                                        return true;
                                    }}
                                />
                            </div>

                            {/* Right Panel - Time Slots */}
                            <div className="p-6">
                                {loadingTimeSlots ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                                        <p className="text-zinc-400 text-sm">Loading time slots...</p>
                                    </div>
                                ) : (
                                    <TimeSlotPicker
                                        timeSlots={timeSlots}
                                        selectedTime={selectedTime}
                                        selectedDate={selectedDate}
                                        onSelect={handleTimeSelect}
                                        timeFormat={timeFormat}
                                        timezone={timezone}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center py-8">
                <p className="text-zinc-400 text-sm">Cal.com</p>
            </div>
        </div>
    );
}

