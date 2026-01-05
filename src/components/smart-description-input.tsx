'use client';

import { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  predictSeverity,
  suggestCategory,
  predictSafeToContinue,
  generateSuggestions,
  suggestActions,
} from '@/lib/smart-autocomplete';

interface SmartDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onPredictionsChange?: (predictions: {
    severity?: string;
    category?: string;
    safeToContinue?: string;
    actions?: string[];
  }) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
}

export function SmartDescriptionInput({
  value,
  onChange,
  onPredictionsChange,
  placeholder,
  rows = 4,
  className,
  id,
}: SmartDescriptionInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [predictions, setPredictions] = useState<{
    severity?: string;
    category?: string;
    safeToContinue?: string;
    actions?: string[];
  }>({});

  // Generate predictions when description changes
  const analyzeMeDescription = useCallback((description: string) => {
    if (description.length < 10) {
      setPredictions({});
      onPredictionsChange?.({});
      return;
    }

    const severity = predictSeverity(description);
    const category = suggestCategory(description);
    const safeToContinue = predictSafeToContinue(description, severity);
    const actions = category ? suggestActions(category, severity) : [];

    const newPredictions = {
      severity,
      category: category || undefined,
      safeToContinue,
      actions,
    };

    setPredictions(newPredictions);
    onPredictionsChange?.(newPredictions);
  }, [onPredictionsChange]);

  // Update suggestions based on input
  useEffect(() => {
    if (value.length >= 3) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Analyze for predictions
    analyzeMeDescription(value);
  }, [value, analyzeMeDescription]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const characterCount = value.length;
  const minCharacters = 10;
  const isValid = characterCount >= minCharacters;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn('resize-none', className)}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Badge
            variant={isValid ? 'default' : 'secondary'}
            className={cn(
              'text-xs',
              isValid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : ''
            )}
          >
            {characterCount}/{minCharacters}
          </Badge>
        </div>
      </div>

      {/* Smart Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900 dark:bg-blue-950/50">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
            <Lightbulb className="h-4 w-4" />
            Smart Suggestions
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto whitespace-normal border-blue-300 bg-white text-left text-xs hover:bg-blue-100 dark:border-blue-800 dark:bg-slate-900 dark:hover:bg-blue-950"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Predictions */}
      {(predictions.severity || predictions.category) && value.length >= minCharacters && (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/50">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            AI Predictions
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {predictions.severity && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Suggested Priority
                </p>
                <Badge
                  variant={
                    predictions.severity === 'CRITICAL'
                      ? 'destructive'
                      : predictions.severity === 'HIGH'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {predictions.severity}
                </Badge>
              </div>
            )}
            {predictions.category && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Suggested Category
                </p>
                <Badge variant="outline">{predictions.category}</Badge>
              </div>
            )}
            {predictions.safeToContinue && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Safe to Drive?
                </p>
                <Badge
                  variant={
                    predictions.safeToContinue === 'No'
                      ? 'destructive'
                      : predictions.safeToContinue === 'Yes'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {predictions.safeToContinue}
                </Badge>
              </div>
            )}
          </div>
          {predictions.actions && predictions.actions.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <AlertCircle className="h-3 w-3" />
                Recommended Actions
              </div>
              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                {predictions.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-blue-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
            💡 These are AI-generated suggestions. You can adjust them before submitting.
          </p>
        </div>
      )}
    </div>
  );
}
