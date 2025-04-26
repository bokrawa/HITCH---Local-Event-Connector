import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  suggestions,
  onSuggestionClick,
  placeholder = 'Search events...'
}: SearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          aria-label="Search events"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isFocused && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                onSuggestionClick(suggestion);
                setIsFocused(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: suggestion.replace(
                    new RegExp(value, 'gi'),
                    (match) => `<mark class="bg-yellow-200 rounded">${match}</mark>`
                  ),
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}