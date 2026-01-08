'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { fetchEventTypeBySlug } from '@/lib/api/eventTypes';
import { createBooking } from '@/lib/api/bookings';
import { createBookingDataFromForm } from '@/lib/utils/bookings';
import { format, addMinutes } from 'date-fns';

export default function BookingFormPage() {
    const { slug } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [eventType, setEventType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Initialize state from URL params
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');
    const [selectedDate] = useState(() => dateParam ? new Date(dateParam) : null);
    const [selectedTime] = useState(() => timeParam ? new Date(decodeURIComponent(timeParam)) : null);

    useEffect(() => {
        const loadEventType = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchEventTypeBySlug(slug);
                setEventType(data);
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

    const handleBack = () => {
        router.push(`/book/${slug}`);
    };

    const handleSubmit = async (formData) => {
        if (!eventType || !selectedDate || !selectedTime) {
            alert('Please select a date and time');
            return;
        }

        // Validate form data - check for required fields
        if (!formData.name || !formData.name.trim()) {
            setError('Name is required');
            return;
        }

        if (!formData.email || !formData.email.trim()) {
            setError('Email address is required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate that the selected date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);

        if (selectedDateOnly < today) {
            alert('Cannot book for past dates. Please select a future date.');
            return;
        }

        // Validate that the selected time is not in the past (if date is today)
        if (selectedDateOnly.getTime() === today.getTime()) {
            const now = new Date();
            const selectedDateTime = new Date(selectedDate);
            selectedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);

            if (selectedDateTime < now) {
                alert('Cannot book for past times. Please select a future time.');
                return;
            }
        }

        try {
            setSubmitting(true);
            setError(null);

            // Create booking data
            const bookingData = createBookingDataFromForm(formData, eventType, selectedDate, selectedTime);

            // Submit to API
            const createdBooking = await createBooking(bookingData);

            // Navigate to confirmation page with booking ID
            router.push(`/book/${slug}/confirmation?id=${createdBooking.id}`);
        } catch (err) {
            console.error('Failed to create booking:', err);
            setError(err.message || 'Failed to create booking. Please try again.');
            alert(err.message || 'Failed to create booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (date, duration) => {
        if (!date) return '';
        try {
            const startTime = format(date, 'HH:mm');
            const endTime = format(addMinutes(date, duration || 15), 'HH:mm');
            return `${startTime}-${endTime}`;
        } catch {
            return '';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        try {
            return format(date, 'EEEE, MMMM d, yyyy');
        } catch {
            return '';
        }
    };

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
            </div>

            {/* Main content - Unified card layout */}
            <div className="flex-1 flex items-center justify-center px-8 py-8">
                <div className="w-full max-w-4xl">
                    <div className="bg-[#101010] border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Left Panel - Event Details */}
                            <div className="md:w-5/12 p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                                        {hostName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-white font-semibold">{hostName}</h2>
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold text-white mb-4">{eventType.name}</h1>
                                {eventType.description && (
                                    <p className="text-zinc-400 mb-6">{eventType.description}</p>
                                )}

                                <div className="space-y-4 text-sm">
                                    {selectedDate && (
                                        <div className="flex items-center gap-2 text-gray-400 font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(selectedDate)}</span>
                                        </div>
                                    )}

                                    {selectedTime && (
                                        <div className="flex items-center gap-2 text-gray-400 font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{formatTime(selectedTime, eventType.duration)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-gray-400 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{eventType.duration}m</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-400 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{location}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-400 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M3.055 11H1m2.055 0a9.97 9.97 0 0113.89 0M21 11h-2.945M21 11H23m-2.945 0a9.97 9.97 0 00-13.89 0M9 8a3 3 0 110-6 3 3 0 010 6z" />
                                        </svg>
                                        <span>{timezone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Booking Form */}
                            <div className="md:w-7/12 p-8 border-l border-zinc-800">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}
                                <BookingForm
                                    onSubmit={handleSubmit}
                                    onBack={handleBack}
                                    eventType={eventType}
                                />
                                {submitting && (
                                    <div className="mt-4 text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                                        <p className="text-zinc-400 text-sm">Creating booking...</p>
                                    </div>
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

