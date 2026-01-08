'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { fetchEventTypeById, updateEventType, deleteEventType } from '@/lib/api/eventTypes';

export default function EventTypeEditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [eventType, setEventType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(15);
    const [location, setLocation] = useState('Cal Video (Default)');
    const [allowMultipleDurations, setAllowMultipleDurations] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadEventType = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchEventTypeById(id);
                if (!data) {
                    setError('Event type not found');
                } else {
                    setEventType(data);
                    setTitle(data.name || '');
                    setDescription(data.description || '');
                    setDuration(data.duration || 15);
                    // Location is not stored in DB, so we use default
                }
            } catch (err) {
                console.error('Failed to load event type:', err);
                setError(err.message || 'Failed to load event type');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadEventType();
        }
    }, [id]);

    const getEventUrl = () => {
        if (!eventType) return '';
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const slug = eventType.url_slug || eventType.name;
        return `${baseUrl}/book/${slug}`;
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} mins`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }
        return `${hours}h ${mins}m`;
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateEventType(id, {
                name: title,
                description: description,
                duration: parseInt(duration),
            });
            // Reload to get updated data
            const updated = await fetchEventTypeById(id);
            setEventType(updated);
            alert('Event type saved successfully!');
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Failed to save event type');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this event type?')) {
            try {
                await deleteEventType(id);
                router.push('/');
            } catch (err) {
                console.error('Failed to delete:', err);
                alert('Failed to delete event type');
            }
        }
    };

    const handleCopyLink = async () => {
        const url = getEventUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleCopyEmbed = () => {
        const embedCode = `<iframe src="${getEventUrl()}" width="100%" height="600" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        alert('Embed code copied to clipboard!');
    };

    const handlePreview = () => {
        window.open(getEventUrl(), '_blank');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-zinc-400">Loading event details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !eventType) {
        return (
            <div className="flex min-h-screen bg-black">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{error || 'Event type not found'}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const eventUrl = getEventUrl();
    const urlDisplay = eventUrl.replace(/^https?:\/\//, '');

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />

            <div className="flex-1 flex">
                {/* Left Panel - Configuration Sections */}
                <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-6">
                    <div className="space-y-1">
                        {/* Basics */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Basics</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">{formatDuration(duration)}</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Availability</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">Working Hours</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Limits</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">How often you can be booked</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Advanced */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Advanced</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">Calendar settings & more...</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Recurring */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Recurring</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">Set up a repeating schedule</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Apps */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Apps</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">0 apps, 0 active</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Workflows */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Workflows</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">0 active</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Webhooks */}
                        <div className="px-3 py-2 rounded-md hover:bg-zinc-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-white">Webhooks</div>
                                    <div className="text-xs text-zinc-400 mt-0.5">0 active</div>
                                </div>
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Top Bar */}
                    <div className="border-b border-zinc-800 px-8 py-4 flex items-center justify-between bg-zinc-900">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-1 text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-white">{title || 'Event Type'}</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Toggle Switch */}
                            <button
                                onClick={() => setIsActive(!isActive)}
                                className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${isActive ? 'bg-orange-500' : 'bg-zinc-700'}
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                        ${isActive ? 'translate-x-6' : 'translate-x-1'}
                                    `}
                                />
                            </button>

                            {/* Preview */}
                            <button
                                onClick={handlePreview}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                                title="Preview"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>

                            {/* External Link */}
                            <a
                                href={eventUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                                title="Open in new tab"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>

                            {/* Copy Link */}
                            <button
                                onClick={handleCopyLink}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                                title={copied ? 'Copied!' : 'Copy link'}
                            >
                                {copied ? (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>

                            {/* Embed Code */}
                            <button
                                onClick={handleCopyEmbed}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                                title="Copy embed code"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </button>

                            {/* Delete */}
                            <button
                                onClick={handleDelete}
                                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Delete"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            {/* Save */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-white text-black rounded-md font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className="max-w-3xl space-y-8">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                    placeholder="Event title"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                                {/* Formatting Toolbar */}
                                <div className="flex items-center gap-2 mb-2 border-b border-zinc-800 pb-2">
                                    <button
                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                        title="Bold"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                        title="Italic"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </button>
                                    <button
                                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                        title="Link"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </button>
                                </div>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
                                    placeholder="Add a description for your event"
                                />
                            </div>

                            {/* URL */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">URL</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={urlDisplay}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono text-sm focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Duration</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                                        min="1"
                                        className="w-24 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                                    />
                                    <span className="text-white">Minutes</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        onClick={() => setAllowMultipleDurations(!allowMultipleDurations)}
                                        className={`
                                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                            ${allowMultipleDurations ? 'bg-orange-500' : 'bg-zinc-700'}
                                        `}
                                    >
                                        <span
                                            className={`
                                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                ${allowMultipleDurations ? 'translate-x-6' : 'translate-x-1'}
                                            `}
                                        />
                                    </button>
                                    <label className="text-sm text-white">Allow multiple durations</label>
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Location</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md">
                                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span className="flex-1 text-white">{location}</span>
                                        <button
                                            onClick={() => setLocation('')}
                                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="text-xs text-zinc-500">
                                        Can&apos;t find the right conferencing app? Visit our{' '}
                                        <a href="#" className="text-zinc-400 hover:text-white underline">App Store</a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
