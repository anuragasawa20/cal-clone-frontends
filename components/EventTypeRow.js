'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventTypeRow({ eventType, onDelete, isLast = false }) {
    const router = useRouter();
    const [isActive, setIsActive] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        }
        return `${hours}h ${mins}m`;
    };

    const getEventUrl = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const slug = eventType.url_slug || eventType.name;
        return `${baseUrl}/book/${slug}`;
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
        setShowMenu(false);
    };

    const handleCopyEmbed = () => {
        const embedCode = `<iframe src="${getEventUrl()}" width="100%" height="600" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this event type?')) {
            onDelete(eventType.id);
        }
        setShowMenu(false);
    };

    const handleRowClick = (e) => {
        // Don't navigate if clicking on action buttons or links
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        router.push(`/event-types/${eventType.id}`);
    };

    return (
        <div
            className={`w-full flex items-center justify-between border-b border-gray-800 py-4 hover:bg-zinc-800/50 transition-colors cursor-pointer px-4 ${isLast ? 'border-b-0' : ''}`}
            onClick={handleRowClick}
        >
            {/* Left side - Event info with vertical stack */}
            <div className="flex-1 min-w-0">
                {/* Top row: Title + Slug */}
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{eventType.name}</h3>
                    <span className="text-gray-400 font-normal font-mono text-sm">
                        /shri-mali-kvbasr/{eventType.url_slug || eventType.name}
                    </span>
                    {!isActive && (
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded">
                            Hidden
                        </span>
                    )}
                </div>

                {/* Middle row: Description */}
                {eventType.description && (
                    <p className="text-gray-400 text-sm mb-2">{eventType.description}</p>
                )}

                {/* Bottom row: Duration badge with icon */}
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="bg-zinc-800 text-gray-300 px-2 py-1 rounded-full text-xs">
                        {formatDuration(eventType.duration)}
                    </span>
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3 ml-4">
                {/* Toggle Switch - Monochrome */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsActive(!isActive);
                    }}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${isActive ? 'bg-white' : 'bg-zinc-700'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full transition-transform
                            ${isActive ? 'bg-black translate-x-6' : 'bg-zinc-400 translate-x-1'}
                        `}
                    />
                </button>

                {/* Action Button Group */}
                <div className="flex items-center border border-gray-700 rounded">
                    {/* External Link */}
                    <a
                        href={getEventUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-zinc-400 hover:text-white transition-colors border-r border-gray-700"
                        title="Open in new tab"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>

                    {/* Copy Link */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink();
                        }}
                        className="p-2 text-zinc-400 hover:text-white transition-colors border-r border-gray-700"
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

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-20">
                                    <div className="py-1">
                                        <button
                                            onClick={handleCopyEmbed}
                                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                                        >
                                            Copy embed code
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

