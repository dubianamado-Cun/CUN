import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleToggle = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelection);
  };
  
  const getButtonText = () => {
    if (selectedOptions.length === 0) return `Seleccionar ${label}`;
    if (selectedOptions.length === 1) return selectedOptions[0];
    return `${selectedOptions.length} seleccionados`;
  };

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-sm font-medium text-text-secondary mb-1 block">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-left"
      >
        <span className="truncate">{getButtonText()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg flex flex-col">
          <div className="p-2 border-b">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-primary focus:border-primary bg-white text-text-primary"
                  onClick={e => e.stopPropagation()}
                />
                <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                <div
                  key={option}
                  className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleToggle(option)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedOptions.includes(option)}
                    readOnly
                  />
                  <span className="ml-3 truncate">{option}</span>
                </div>
              ))
            ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No se encontraron resultados.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;