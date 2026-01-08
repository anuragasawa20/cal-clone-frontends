'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AvailabilityHeader from '@/components/availability/AvailabilityHeader';
import AvailabilitySchedule from '@/components/availability/AvailabilitySchedule';
import DateOverrides from '@/components/availability/DateOverrides';
import AvailabilitySidebar from '@/components/availability/AvailabilitySidebar';
import { DAYS } from '@/constants/availability';
import { getDefaultAvailability, transformAvailabilityFromAPI, transformAvailabilityToAPI } from '@/lib/utils/availability';
import { fetchAvailabilityById, fetchDefaultAvailability, createAvailability, updateAvailability, deleteAvailability } from '@/lib/api/availability';

export default function AvailabilityDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const searchParams = useSearchParams();

    const [title, setTitle] = useState('');
    const [timezone, setTimezone] = useState('Europe/London');
    const [isDefault, setIsDefault] = useState(false);
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [availabilityId, setAvailabilityId] = useState(null);

    useEffect(() => {
        const loadAvailability = async () => {
            const isNew = searchParams.get('new') === 'true';
            const nameFromQuery = searchParams.get('name');

            setLoading(true);
            setError(null);

            try {
                if (isNew && nameFromQuery) {
                    // New availability - use defaults
                    const decodedName = decodeURIComponent(nameFromQuery);
                    const defaultAvailability = getDefaultAvailability();
                    setTitle(decodedName);
                    setIsDefault(false);
                    setTimezone('Europe/London');
                    setAvailability(defaultAvailability);
                    setAvailabilityId(null);
                } else {
                    // Existing availability - fetch from API
                    const numericId = parseInt(id);
                    if (isNaN(numericId)) {
                        throw new Error('Invalid availability ID');
                    }

                    // Fetch availability and default availability in parallel
                    const [availabilityData, defaultAvailabilityData] = await Promise.all([
                        fetchAvailabilityById(numericId),
                        fetchDefaultAvailability()
                    ]);

                    const transformed = transformAvailabilityFromAPI(availabilityData);
                    if (!transformed) {
                        throw new Error('Availability not found');
                    }

                    setTitle(transformed.name);
                    setTimezone(transformed.timezone || 'Europe/London');
                    setAvailability(transformed.availability);
                    setAvailabilityId(transformed.id);

                    // Check if this is the default availability
                    if (defaultAvailabilityData && defaultAvailabilityData.id === transformed.id) {
                        setIsDefault(true);
                    } else {
                        setIsDefault(false);
                    }
                }
            } catch (err) {
                console.error('Error loading availability:', err);
                setError(err.message || 'Failed to load availability');
            } finally {
                setLoading(false);
            }
        };

        loadAvailability();
    }, [id, searchParams]);

    const handleDayToggle = (day) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                enabled: !prev[day].enabled
            }
        }));
    };

    const handleTimeRangeChange = (day, rangeIndex, newRange) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeRanges: prev[day].timeRanges.map((range, idx) =>
                    idx === rangeIndex ? { ...range, ...newRange } : range
                )
            }
        }));
    };

    const handleAddTimeRange = (day) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeRanges: [...prev[day].timeRanges, { startTime: '09:00', endTime: '17:00' }]
            }
        }));
    };

    const handleRemoveTimeRange = (day, rangeIndex) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeRanges: prev[day].timeRanges.filter((_, idx) => idx !== rangeIndex)
            }
        }));
    };

    const handleCopyDay = (sourceDay) => {
        const sourceData = availability[sourceDay];
        if (!sourceData || !sourceData.enabled) return;

        // Copy to all other enabled days
        setAvailability(prev => {
            const updated = { ...prev };
            DAYS.forEach(day => {
                if (day.value !== sourceDay && prev[day.value]?.enabled) {
                    updated[day.value] = {
                        ...prev[day.value],
                        timeRanges: sourceData.timeRanges.map(range => ({ ...range }))
                    };
                }
            });
            return updated;
        });
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a name for this availability schedule');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const apiData = transformAvailabilityToAPI(availability, title.trim(), timezone);
            let savedAvailability;

            if (availabilityId) {
                // Update existing availability
                savedAvailability = await updateAvailability(availabilityId, apiData);
            } else {
                // Create new availability
                savedAvailability = await createAvailability(apiData);
                setAvailabilityId(savedAvailability.id);
                // Update URL to use the new ID
                router.replace(`/availability/${savedAvailability.id}`);
            }

            const transformed = transformAvailabilityFromAPI(savedAvailability);
            setTitle(transformed.name);
            setTimezone(transformed.timezone || 'Europe/London');
            setAvailability(transformed.availability);

            alert('Availability saved successfully!');
        } catch (err) {
            console.error('Error saving availability:', err);
            const errorMessage = err.message || 'Failed to save availability';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!availabilityId) {
            // New availability - just navigate away
            router.push('/availability');
            return;
        }

        if (!confirm('Are you sure you want to delete this availability schedule?')) {
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await deleteAvailability(availabilityId);
            router.push('/availability');
        } catch (err) {
            console.error('Error deleting availability:', err);
            const errorMessage = err.message || 'Failed to delete availability';
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white">Loading availability...</div>
                </div>
            </div>
        );
    }

    if (error && !availabilityId) {
        return (
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-400 mb-4">{error}</div>
                        <button
                            onClick={() => router.push('/availability')}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1C1C1C] border border-[#2E2E2E] rounded-md hover:bg-[#2E2E2E] transition-colors"
                        >
                            Back to Availability
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />
            <div className="flex-1 flex">
                {/* Main content */}
                <div className="flex-1 p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <AvailabilityHeader
                        title={title}
                        availability={availability}
                        onTitleChange={setTitle}
                    />

                    <AvailabilitySchedule
                        availability={availability}
                        onDayToggle={handleDayToggle}
                        onTimeRangeChange={handleTimeRangeChange}
                        onAddTimeRange={handleAddTimeRange}
                        onRemoveTimeRange={handleRemoveTimeRange}
                        onCopyDay={handleCopyDay}
                    />

                    <DateOverrides />
                </div>

                {/* Right panel */}
                <AvailabilitySidebar
                    isDefault={isDefault}
                    timezone={timezone}
                    onDefaultToggle={() => setIsDefault(!isDefault)}
                    onTimezoneChange={setTimezone}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    saving={saving}
                />
            </div>
        </div>
    );
}
