'use client';

import { cn } from '@/lib/utils';

export default function FilterTabs({
    tabs = [],
    activeTab,
    onTabChange,
    className
}) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value || activeTab === tab;
                const tabValue = typeof tab === 'string' ? tab : tab.value;
                const tabLabel = typeof tab === 'string' ? tab : tab.label || tab.value;

                return (
                    <button
                        key={tabValue}
                        onClick={() => onTabChange && onTabChange(tabValue)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors rounded-md border",
                            isActive
                                ? "text-white bg-zinc-800 border-zinc-700"
                                : "text-zinc-400 hover:text-white border-transparent"
                        )}
                    >
                        {tabLabel}
                    </button>
                );
            })}
        </div>
    );
}

