import React from 'react';
import { User as UserIcon, Bookmark, Flame, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  submissionsCount: number;
}

export default function ProfileTabs({ activeTab, setActiveTab, savedCount, submissionsCount }: ProfileTabsProps) {
  const tabs = [
    { id: 'about', label: 'About', icon: UserIcon },
    { id: 'saved', label: `Saved (${savedCount})`, icon: Bookmark },
    { id: 'personalized', label: 'Personalized', icon: Flame },
    { id: 'submissions', label: `My Submissions (${submissionsCount})`, icon: Send },
  ];

  return (
    <div className="mt-4 mb-10 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap",
            activeTab === tab.id 
              ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
              : "bg-white text-gray-500 border border-transparent hover:bg-gray-50"
          )}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
