'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { fetchAvailabilities, fetchDefaultAvailability } from '@/lib/api/availability';
import { transformAvailabilitiesFromAPI, getSummaryText } from '@/lib/utils/availability';

export default function AvailabilityPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('My Availability');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newScheduleName, setNewScheduleName] = useState('');
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [defaultAvailabilityId, setDefaultAvailabilityId] = useState(null);

    useEffect(() => {
        const loadAvailabilities = async () => {
            setLoading(true);
            setError(null);

            try {
                const [availabilitiesData, defaultAvailabilityData] = await Promise.all([
                    fetchAvailabilities(),
                    fetchDefaultAvailability()
                ]);

                const transformed = transformAvailabilitiesFromAPI(availabilitiesData);
                setAvailabilities(transformed);

                if (defaultAvailabilityData) {
                    setDefaultAvailabilityId(defaultAvailabilityData.id);
                }
            } catch (err) {
                console.error('Error loading availabilities:', err);
                setError(err.message || 'Failed to load availabilities');
            } finally {
                setLoading(false);
            }
        };

        loadAvailabilities();
    }, []);

    const handleAvailabilityClick = (id) => {
        router.push(`/availability/${id}`);
    };

    // Format availability for display
    const formatAvailabilityForDisplay = (availability) => {
        const scheduleText = getSummaryText(availability.availability);
        return scheduleText.map(text => {
            // Parse "Mon - Fri: 9:00 AM - 5:00 PM" format
            const [dayPart, timePart] = text.split(': ');
            return {
                day: dayPart,
                time: timePart
            };
        });
    };

    const handleNewClick = () => {
        setIsModalOpen(true);
        setNewScheduleName('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewScheduleName('Working Hours');
    };

    const handleContinue = () => {
        if (newScheduleName.trim()) {
            // Generate a new ID (in real app, this would come from backend)
            const newId = `new-${Date.now()}`;
            // Navigate to details page with the new schedule name
            router.push(`/availability/${newId}?name=${encodeURIComponent(newScheduleName.trim())}&new=true`);
        }
    };

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />
            <div className="flex-1 p-8">
                {/* Container - Full Width */}
                <div>
                    {/* Header - Split Layout */}
                    <div className="mb-8 flex justify-between items-center">
                        {/* Left: Title and Description */}
                        <div>
                            <h1 className="text-3xl font-semibold text-white mb-2">Availability</h1>
                            <p className="text-sm text-zinc-400">
                                Configure times when you are available for bookings.
                            </p>
                        </div>

                        {/* Right: Actions Group (Tabs + New Button) */}
                        <div className="flex items-center gap-3">
                            {/* Segmented Control - Tabs */}
                            <div className="flex items-center bg-[#1C1C1C] rounded-md p-1 border border-[#2E2E2E]">
                                <button
                                    onClick={() => setActiveTab('My Availability')}
                                    className={`px-4 py-2 text-sm font-medium rounded transition-all ${activeTab === 'My Availability'
                                        ? 'bg-white text-[#101010] shadow-sm'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    My Availability
                                </button>
                                <button
                                    onClick={() => setActiveTab('Team Availability')}
                                    className={`px-4 py-2 text-sm font-medium rounded transition-all ${activeTab === 'Team Availability'
                                        ? 'bg-white text-[#101010] shadow-sm'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    Team Availability
                                </button>
                            </div>

                            {/* New Button */}
                            <button
                                onClick={handleNewClick}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#1C1C1C] border border-[#2E2E2E] rounded-md hover:bg-[#2E2E2E] transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New
                            </button>
                        </div>
                    </div>

                    {/* Availability List - One Container with Border */}
                    <div className="border border-[#2E2E2E] rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-zinc-400">
                                Loading availabilities...
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="text-red-400 mb-4">{error}</div>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#1C1C1C] border border-[#2E2E2E] rounded-md hover:bg-[#2E2E2E] transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : availabilities.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400">
                                No availability schedules found. Create one to get started.
                            </div>
                        ) : (
                            availabilities.map((availability, index) => {
                                const schedule = formatAvailabilityForDisplay(availability);
                                const isDefault = availability.id === defaultAvailabilityId;

                                return (
                                    <div
                                        key={availability.id}
                                        onClick={() => handleAvailabilityClick(availability.id)}
                                        className={`p-4 cursor-pointer hover:bg-[#252525] transition-colors ${index !== availabilities.length - 1 ? 'border-b border-[#2E2E2E]' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-white font-medium">{availability.name}</h3>
                                                    {isDefault && (
                                                        <span className="px-2 py-0.5 text-xs font-medium text-zinc-300 bg-zinc-800 rounded-full uppercase tracking-wider">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    {schedule.length > 0 ? (
                                                        schedule.map((item, idx) => (
                                                            <p key={idx} className="text-sm text-zinc-400">
                                                                {item.day}: {item.time}
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-zinc-400">No availability set</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M3.055 11H1m2.055 0a9.97 9.97 0 0113.89 0M21 11h-2.945M21 11H23m-2.945 0a9.97 9.97 0 00-13.89 0M9 8a3 3 0 110-6 3 3 0 010 6z" />
                                                    </svg>
                                                    <span className="text-xs text-zinc-500">{availability.timezone || 'UTC'}</span>
                                                </div>
                                            </div>
                                            {/* Ghost Button - Menu */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle menu click
                                                }}
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors border border-[#2E2E2E]"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-zinc-400">
                            Temporarily Out-Of-Office?{' '}
                            <button className="text-blue-400 hover:text-blue-300 underline">
                                Add a redirect
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold text-white mb-6">Add a new schedule</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={newScheduleName}
                                onChange={(e) => setNewScheduleName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleContinue()}
                                placeholder="Working Hours"
                                className="w-full px-3 py-2 bg-[#101010] border border-[#2E2E2E] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleContinue}
                                disabled={!newScheduleName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
