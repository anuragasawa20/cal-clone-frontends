'use client';

export default function DateOverrides() {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-white">Date overrides</h2>
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
                Add dates when your availability changes from your daily hours.
            </p>
            <button className="px-4 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-md text-white text-sm hover:bg-[#2E2E2E] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add an override
            </button>
        </div>
    );
}

