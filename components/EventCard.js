// frontend/components/EventCard.js
import Link from 'next/link';

export default function EventCard({ eventType }) {
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

    return (
        <Link
            href={`/book/${eventType.id}`}
            className="group block"
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                        {eventType.name}
                    </h3>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {formatDuration(eventType.duration)}
                    </span>
                </div>

                {eventType.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {eventType.description}
                    </p>
                )}

                <div className="mt-4 flex items-center text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    <span>Book event</span>
                    <svg
                        className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}