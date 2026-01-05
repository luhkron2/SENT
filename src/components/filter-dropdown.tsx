'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  value?: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function FilterDropdown({ label, options, value = [], onChange, className }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const clearAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        {label}
        {value.length > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {value.length}
          </span>
        )}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-50 mt-2 w-64 rounded-lg border bg-white shadow-lg dark:bg-slate-900">
            <div className="p-3 border-b dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Select {label}</span>
                {value.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleOption(option.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
                      isSelected
                        ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center',
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 dark:border-slate-600'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t dark:border-slate-700">
              <Button
                size="sm"
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
