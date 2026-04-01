// ComboBox.tsx
// Dropdown that also accepts free text.
// Shows filtered suggestions while typing; click a suggestion to select it.
// Closes on outside click or Escape.

import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface ComboBoxProps {
  id?: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];           // suggestion list
  placeholder?: string;
  hint?: string;
  mono?: boolean;              // monospace font for SMILES fields
  disabled?: boolean;
}

export default function ComboBox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = '',
  hint,
  mono = false,
  disabled = false,
}: ComboBoxProps) {
  const uid          = useId();
  const inputId      = id ?? uid;
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const containerRef        = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);
  const listRef             = useRef<HTMLUListElement>(null);

  // Sync internal query to external value when value changes externally
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim() === ''
    ? options.slice(0, 80)           // show first 80 when empty
    : options
        .filter(o => o.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 80);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = (opt: string) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const first = listRef.current?.querySelector('li') as HTMLElement | null;
      first?.focus();
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, opt: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(opt); }
    if (e.key === 'Escape')  { setOpen(false); inputRef.current?.focus(); }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      (e.currentTarget.nextSibling as HTMLElement)?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = e.currentTarget.previousSibling as HTMLElement | null;
      prev ? prev.focus() : inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-600">
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full px-3 py-2 pr-16 rounded-lg border border-slate-200 bg-white
            text-sm text-slate-800 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-slate-50 disabled:text-slate-400
            ${mono ? 'font-mono' : ''}`}
        />

        {/* clear button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        )}

        {/* chevron */}
        <button
          type="button"
          onClick={() => { setOpen(o => !o); inputRef.current?.focus(); }}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          tabIndex={-1}
        >
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* dropdown list */}
        {open && filtered.length > 0 && (
          <ul
            ref={listRef}
            role="listbox"
            className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto
              bg-white border border-slate-200 rounded-lg shadow-lg py-1"
          >
            {filtered.map((opt, i) => (
              <li
                key={i}
                role="option"
                tabIndex={0}
                aria-selected={opt === value}
                onClick={() => handleSelect(opt)}
                onKeyDown={e => handleItemKeyDown(e, opt)}
                className={`px-3 py-2 text-sm cursor-pointer outline-none
                  hover:bg-blue-50 focus:bg-blue-50
                  ${opt === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}
                  ${mono ? 'font-mono text-xs' : ''}`}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
