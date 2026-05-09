import React from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  containerClassName?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  icon: Icon, 
  containerClassName, 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className={cn("relative group select-none", containerClassName)}>
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-blue-600 z-10">
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
        </div>
      )}
      <select
        {...props}
        className={cn(
          "w-full bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-700 appearance-none cursor-pointer transition-all outline-none shadow-sm hover:shadow-md hover:bg-white hover:border-blue-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
          Icon ? "pl-12" : "pl-6",
          "pr-12 py-4 text-sm relative z-0",
          className
        )}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );
};
