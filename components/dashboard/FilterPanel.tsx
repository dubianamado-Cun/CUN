import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MultiSelectDropdown from '../ui/MultiSelectDropdown';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    availableFilters: { [key: string]: string[] };
    activeFilters: { [key: string]: string[] };
    onFiltersChange: (filters: { [key: string]: string[] }) => void;
}

const FILTER_LABELS: { [key: string]: string } = {
    creation_month_name: 'Mes de Creación',
    ticket_owner_name: 'Licencia',
    category: 'Solicitud / Categoría',
    sub_category: 'Sub Categorías',
    regional_sede: 'Regional Sede',
    programa: 'Programa'
};

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, availableFilters, activeFilters, onFiltersChange }) => {
    const [stagedFilters, setStagedFilters] = useState(activeFilters);

    useEffect(() => {
        setStagedFilters(activeFilters);
    }, [activeFilters, isOpen]);

    const handleApply = () => {
        onFiltersChange(stagedFilters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters: { [key: string]: string[] } = {};
        Object.keys(FILTER_LABELS).forEach(key => {
            clearedFilters[key] = [];
        });
        setStagedFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const handleSelectionChange = (key: string, newSelection: string[]) => {
        setStagedFilters(prev => ({ ...prev, [key]: newSelection }));
    };

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div 
                className={`fixed top-0 right-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold text-text-primary">Filtros</h3>
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                       {Object.entries(FILTER_LABELS).map(([key, label]) => {
                           const options = availableFilters[key] || [];
                           if (options.length === 0) return null;
                           return (
                               <MultiSelectDropdown 
                                    key={key}
                                    label={label}
                                    options={options}
                                    selectedOptions={stagedFilters[key] || []}
                                    onChange={(selection) => handleSelectionChange(key, selection)}
                               />
                           )
                       })}
                    </div>

                    <div className="p-4 border-t bg-white flex space-x-2">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-text-secondary bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Limpiar
                        </button>
                         <button
                            onClick={handleApply}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-accent"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterPanel;