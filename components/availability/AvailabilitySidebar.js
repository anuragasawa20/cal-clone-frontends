'use client';

import TimezoneSelector from '@/components/ui/TimezoneSelector';

export default function AvailabilitySidebar({
    isDefault,
    timezone,
    onDefaultToggle,
    onTimezoneChange,
    onSave,
    onDelete,
    saving = false
}) {
    return (
        <div className="w-80 p-6 border-l border-[#2E2E2E]">
            <div className="flex flex-col h-full">
                {/* Top Section - Actions in Flex Row */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Set as Default</span>
                        <button
                            onClick={onDefaultToggle}
                            disabled={saving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDefault ? 'bg-white' : 'bg-[#2E2E2E]'
                                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${isDefault ? 'translate-x-6 bg-black' : 'translate-x-1 bg-zinc-400'
                                    }`}
                            />
                        </button>
                    </div>
                    <div className="w-px h-6 bg-[#2E2E2E]"></div>
                    <button
                        onClick={onDelete}
                        disabled={saving}
                        className={`p-2 text-zinc-400 hover:text-red-400 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <div className="w-px h-6 bg-[#2E2E2E]"></div>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className={`px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-zinc-900 transition-colors text-sm ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>

                {/* Bottom Section - Settings and Troubleshooter Grouped Together */}
                <div className="flex-1 space-y-6">
                    {/* Timezone */}
                    <div>
                        <TimezoneSelector
                            value={timezone}
                            onChange={onTimezoneChange}
                            label="Timezone"
                        />
                    </div>

                    {/* Troubleshooter */}
                    <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-2">
                            Something doesn&apos;t look right?
                        </h3>
                        <button className="w-full px-4 py-2 bg-[#2E2E2E] border border-[#2E2E2E] rounded-md text-white text-sm hover:bg-[#3E3E3E] transition-colors">
                            Launch troubleshooter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

