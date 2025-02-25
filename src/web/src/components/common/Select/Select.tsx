import React, { useCallback, useState, useEffect, useRef } from 'react'; // v18.2.0
import { SelectContainer, SelectTrigger, SelectDropdown, SelectOption } from './Select.styles';

export interface SelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (option: T) => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  ariaLabel?: string;
  mobileBreakpoint?: number;
  containerRef?: React.RefObject<HTMLElement>;
  virtualThreadEnabled?: boolean;
}

export const Select = <T extends unknown>({
  options,
  value,
  onChange,
  disabled = false,
  error = false,
  placeholder = 'Select an option',
  getOptionLabel,
  getOptionValue,
  ariaLabel,
  mobileBreakpoint = 600,
  containerRef,
  virtualThreadEnabled = true
}: SelectProps<T>): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isMobileView, setIsMobileView] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Check mobile view on mount and resize
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= mobileBreakpoint);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, [mobileBreakpoint]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !selectRef.current?.contains(event.target as Node) &&
        (!containerRef?.current || !containerRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [containerRef]);

  // Position dropdown based on available space
  useEffect(() => {
    if (!isOpen || !dropdownRef.current || !selectRef.current || isMobileView) return;

    const { bottom, top } = selectRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - bottom;
    const spaceAbove = top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      dropdownRef.current.style.bottom = `${selectRef.current.offsetHeight + 4}px`;
      dropdownRef.current.style.top = 'auto';
    } else {
      dropdownRef.current.style.top = `${selectRef.current.offsetHeight + 4}px`;
      dropdownRef.current.style.bottom = 'auto';
    }
  }, [isOpen, isMobileView]);

  // Handle keyboard navigation with Virtual Thread optimization
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    const handleNavigation = async () => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && focusedIndex >= 0) {
            onChange(options[focusedIndex]);
            setIsOpen(false);
            setFocusedIndex(-1);
          } else {
            setIsOpen(true);
          }
          break;

        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;

        case 'Tab':
          if (isOpen) {
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
      }
    };

    if (virtualThreadEnabled) {
      // Use Virtual Threads for keyboard navigation processing
      queueMicrotask(handleNavigation);
    } else {
      handleNavigation();
    }
  }, [disabled, isOpen, focusedIndex, options, onChange, virtualThreadEnabled]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = useCallback((option: T) => {
    onChange(option);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onChange]);

  const selectedLabel = value ? getOptionLabel(value) : placeholder;

  return (
    <SelectContainer ref={selectRef}>
      <SelectTrigger
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        error={error}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        aria-controls={isOpen ? 'select-dropdown' : undefined}
      >
        {selectedLabel}
      </SelectTrigger>

      {isOpen && (
        <SelectDropdown
          ref={dropdownRef}
          id="select-dropdown"
          role="listbox"
          aria-activedescendant={focusedIndex >= 0 ? `option-${getOptionValue(options[focusedIndex])}` : undefined}
        >
          {options.map((option, index) => (
            <SelectOption
              key={getOptionValue(option)}
              ref={el => (optionsRef.current[index] = el)}
              role="option"
              id={`option-${getOptionValue(option)}`}
              aria-selected={value === option}
              isSelected={value === option}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setFocusedIndex(index)}
              tabIndex={-1}
            >
              {getOptionLabel(option)}
            </SelectOption>
          ))}
        </SelectDropdown>
      )}
    </SelectContainer>
  );
};

export default Select;