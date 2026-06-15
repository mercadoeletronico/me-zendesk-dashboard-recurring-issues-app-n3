'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  maxSuggestions?: number;
}

export function SearchInput({
  value,
  onChange,
  options,
  placeholder = 'Buscar...',
  className = '',
  maxSuggestions = 8,
}: SearchInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const suggestions = value.trim()
    ? options
        .filter((o) => o.toLowerCase().includes(value.toLowerCase()))
        .slice(0, maxSuggestions)
    : [];

  const handleChange = useCallback((v: string) => {
    onChange(v);
    setOpen(true);
  }, [onChange]);

  const handleSelect = useCallback((v: string) => {
    onChange(v);
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className={'relative ' + className}>
      {/* Lupa */}
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (value.trim()) setOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                   bg-gray-50 text-gray-700 placeholder-gray-400"
      />

      {/* Botao X */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-gray-600 transition-colors"
          aria-label="Limpar"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Dropdown de sugestoes */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200
                       rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700
                           hover:bg-blue-50 hover:text-blue-700 transition-colors"
                title={s}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
