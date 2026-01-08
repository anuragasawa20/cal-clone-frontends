'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchEventTypes, deleteEventType } from '@/lib/api/eventTypes';
import EventTypeRow from './EventTypeRow';
import CreateEventTypeModal from './CreateEventTypeModal';

export default function EventTypesList() {
    const [eventTypes, setEventTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadEventTypes();
    }, []);

    const loadEventTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchEventTypes();
            setEventTypes(data || []);
        } catch (error) {
            console.error('Failed to load event types:', error);
            setError(error.message || 'Failed to load event types. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this event type?')) {
            try {
                await deleteEventType(id);
                await loadEventTypes();
            } catch (error) {
                console.error('Failed to delete event type:', error);
                alert('Failed to delete event type');
            }
        }
    };

    const handleCreateSuccess = () => {
        setIsModalOpen(false);
        loadEventTypes();
    };

    // Filter event types based on search query
    const filteredEventTypes = useMemo(() => {
        if (!searchQuery.trim()) {
            return eventTypes;
        }
        const query = searchQuery.toLowerCase();
        return eventTypes.filter(
            (eventType) =>
                eventType.name?.toLowerCase().includes(query) ||
                eventType.url_slug?.toLowerCase().includes(query) ||
                eventType.description?.toLowerCase().includes(query)
        );
    }, [eventTypes, searchQuery]);

    return (
        <div className="w-full bg-black min-h-screen">
            <div className="px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-white mb-1">Event Types</h1>
                        <p className="text-zinc-400 text-sm">
                            Create events to share for people to book on your calendar.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                    >
                        + New
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search event types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Event Types List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-zinc-400">Loading event types...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={loadEventTypes}
                                className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : eventTypes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">No event types yet. Create your first one!</p>
                    </div>
                ) : (
                    <div className="border border-zinc-800 rounded-lg overflow-hidden">
                        {filteredEventTypes.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-zinc-400">No event types match your search.</p>
                            </div>
                        ) : (
                            <>
                                {filteredEventTypes.map((eventType, index) => (
                                    <EventTypeRow
                                        key={eventType.id}
                                        eventType={eventType}
                                        onDelete={handleDelete}
                                        isLast={index === filteredEventTypes.length - 1}
                                    />
                                ))}
                                <div className="text-center py-4 border-t border-zinc-800">
                                    <p className="text-zinc-500 text-sm">No more results</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <CreateEventTypeModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
}

