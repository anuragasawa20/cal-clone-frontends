'use client';

import { useState } from 'react';
import { createEventType } from '@/lib/api/eventTypes';

export default function CreateEventTypeModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '30',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Convert name to hyphenated format before sending to backend
            const formattedName = formData.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

            if (!formattedName) {
                setError('Event name is required');
                setLoading(false);
                return;
            }

            // Validate duration
            const durationValue = parseInt(formData.duration);
            if (isNaN(durationValue) || durationValue < 1) {
                setError('Duration must be a valid number (minimum 1 minute)');
                setLoading(false);
                return;
            }
            if (durationValue > 60) {
                setError('Duration cannot exceed 60 minutes');
                setLoading(false);
                return;
            }

            await createEventType({
                ...formData,
                name: formattedName,
                duration: durationValue
            });
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to create event type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Create New Event Type</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Event Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => {
                                    // Allow free typing - conversion happens on submit
                                    setFormData({ ...formData, name: e.target.value });
                                }}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 30 min meeting or 30-min-meeting"
                            />
                            <p className="text-xs text-zinc-400 mt-1">
                                Will be converted to lowercase with hyphens automatically
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Add a description for your event"
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.duration}
                                onChange={(e) => {
                                    // Allow free typing - validation happens on submit
                                    setFormData({ ...formData, duration: e.target.value });
                                }}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 30"
                            />
                            <p className="text-xs text-zinc-400 mt-1">
                                Maximum: 60 minutes
                            </p>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm">{error}</div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-white text-black rounded-md hover:bg-zinc-100 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

