"use client";
import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface TabNavigatorProps {
    tabs: Tab[];
}

export default function TabNavigator({ tabs }: TabNavigatorProps) {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id);

    return (
        <div className="w-full h-full">
            <div className="">
                <nav className="flex -mb-px font-[family-name:var(--font-fragment-mono)]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-6 font-medium text-base border-b-2 ${
                                activeTab === tab.id
                                    ? 'border-rose-600 text-gray-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-400'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="py-4">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
}