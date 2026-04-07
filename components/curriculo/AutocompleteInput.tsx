import React, { useState, useEffect, useRef } from 'react';
import { useResume } from '../../context/ResumeContext';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type: 'role' | 'school' | 'course' | 'company';
  placeholder?: string;
  className?: string;
  state?: string;
  city?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  onBlur,
  type,
  placeholder,
  className,
  state,
  city
}) => {
  const { getSuggestions, saveSuggestion } = useResume();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length > 1) {
        const data = await getSuggestions(type, state, city);
        const filtered = data.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase());
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value, type, state, city]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    if (value.trim()) {
      saveSuggestion(type, value, state, city);
    }
    if (onBlur) onBlur();
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={() => value.length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 hover:bg-cyan-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
