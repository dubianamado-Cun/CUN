import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ticket } from '../../types';
import Sidebar from './Sidebar';
import ExecutiveSummary from './ExecutiveSummary';
import TemporalAnalysis from './TemporalAnalysis';
import ClassificationAnalysis from './ClassificationAnalysis';
import OperationalEfficiency from './OperationalEfficiency';
import TextAnalysisAsunto from './TextAnalysisAsunto';
import CorrelationAnalysis from './CorrelationAnalysis';
import GeneralAnalysis from './GeneralAnalysis';
import FilterPanel from './FilterPanel';
import AIQueryModal from './AIQueryModal';
import { BarChart2, Clock, Grid, Zap, Type, GitMerge, BrainCircuit, Filter, MessageSquare } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';
import Loader from '../ui/Loader';
import { calculateExecutiveSummaryKpis, calculateTemporalAnalysisData, calculateClassificationData, calculateOperationalEfficiencyData, calculateTextAnalysisAsuntoData, getCorrelationData } from '../../utils/dataProcessing';

interface DashboardProps {
  data: Ticket[];
  fileName: string;
  onReset: () => void;
}

const NAV_ITEMS = [
    { id: 'executive-summary', label: 'Resumen Ejecutivo', icon: BarChart2 },
    { id: 'temporal-analysis', label: 'Análisis Temporal', icon: Clock },
    { id: 'classification-analysis', label: 'Clasificación', icon: Grid },
    { id: 'operational-efficiency', label: 'Eficiencia Operativa', icon: Zap },
    { id: 'text-analysis-asunto', label: 'Análisis de Asunto', icon: Type },
    { id: 'correlation-analysis', label: 'Correlaciones y Patrones', icon: GitMerge },
    { id: 'general-analysis', label: 'Análisis General', icon: BrainCircuit },
];

const getAvailableFilters = (data: Ticket[]): { [key: string]: string[] } => {
    const filters: { [key: string]: Set<string> } = {
        creation_month_name: new Set(),
        ticket_owner_name: new Set(),
        category: new Set(),
        sub_category: new Set(),
        regional_sede: new Set(),
        programa: new Set()
    };
    data.forEach(ticket => {
        Object.keys(filters).forEach(key => {
            if (ticket[key]) {
                filters[key].add(String(ticket[key]));
            }
        });
    });
    const sortedFilters: { [key: string]: string[] } = {};
    Object.keys(filters).forEach(key => {
        sortedFilters[key] = Array.from(filters[key]).sort((a, b) => a.localeCompare(b));
    });
    return sortedFilters;
};

// Main component remains largely the same in structure
const Dashboard: React.FC<DashboardProps> = ({ data, fileName, onReset }) => {
    const [currentView, setCurrentView] = useState('executive-summary');
    const sectionsRef = useRef<Map<string, HTMLElement | null>>(new Map());
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    
    // State for data processing
    const [processedData, setProcessedData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(true);

    const initialFilters = useMemo(() => {
        const filters: { [key: string]: string[] } = {};
        Object.keys(getAvailableFilters([])).forEach(key => {
            filters[key] = [];
        });
        return filters;
    }, []);
    const [activeFilters, setActiveFilters] = useState<{ [key: string]: string[] }>(initialFilters);

    const availableFilters = useMemo(() => getAvailableFilters(data), [data]);

    // FIX: Refactored to use `Object.keys` for better type inference compatibility across different
    // TypeScript environments, resolving issues where array properties (`.length`, `.includes`)
    // on filter values were not recognized, leading to 'unknown' type errors.
    const filteredData = useMemo(() => {
        const filterKeys = Object.keys(activeFilters);
        const hasActiveFilters = filterKeys.some(key => activeFilters[key]?.length > 0);

        if (!hasActiveFilters) return data;

        return data.filter(ticket => {
            return filterKeys.every(key => {
                const values = activeFilters[key];
                if (!values || values.length === 0) {
                    return true;
                }
                return values.includes(String(ticket[key]));
            });
        });
    }, [data, activeFilters]);

    const [compareYears, setCompareYears] = useState(true);
    
    // Stable calculation of comparison years
    const comparisonYears = useMemo(() => {
        const years = [...new Set(data.map(d => d.year).filter((y): y is number => typeof y === 'number'))].sort((a: number, b: number) => b - a);
        if (years.length >= 2) {
            return { current: years[0], previous: years[1] };
        }
        return null;
    }, [data]);
    
    // FIX: Core logic change for asynchronous data processing
    useEffect(() => {
        setIsProcessing(true);
        // Use a timeout to schedule the heavy processing after the current render, preventing UI blocking.
        const processTimeout = setTimeout(() => {
            const allProcessedData = {
                executiveSummary: calculateExecutiveSummaryKpis(filteredData, compareYears, comparisonYears),
                temporalAnalysis: calculateTemporalAnalysisData(filteredData, compareYears, comparisonYears),
                classification: calculateClassificationData(filteredData, compareYears, comparisonYears),
                operationalEfficiency: calculateOperationalEfficiencyData(filteredData, compareYears, comparisonYears),
                textAnalysisAsunto: calculateTextAnalysisAsuntoData(filteredData),
                correlationAnalysis: getCorrelationData(filteredData),
            };
            setProcessedData(allProcessedData);
            setIsProcessing(false);
        }, 100); // A small delay is enough to unblock the main thread

        return () => clearTimeout(processTimeout);

    }, [filteredData, compareYears, comparisonYears]);


    useEffect(() => {
        const canCompare = !!comparisonYears;
        if (!canCompare && compareYears) {
            setCompareYears(false);
        }
    }, [comparisonYears, compareYears]);

    // Intersection Observer for active nav item
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setCurrentView(entry.target.id);
                    }
                });
            },
            { rootMargin: '-40% 0px -60% 0px', threshold: 0 }
        );

        NAV_ITEMS.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) {
                sectionsRef.current.set(item.id, el);
                observer.observe(el);
            }
        });

        return () => {
            sectionsRef.current.forEach(el => {
                if (el) observer.unobserve(el);
            });
        };
    }, []);

    const lastUpdated = useMemo(() => {
        if (data.length === 0) return null;
        const dates = data.map(d => d.modification_time).filter(d => d instanceof Date);
        return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
    }, [data]);
    
    return (
        <div className="flex h-screen bg-background">
            <Sidebar 
                navItems={NAV_ITEMS} 
                currentView={currentView}
                fileName={fileName}
                onReset={onReset}
                ticketCount={filteredData.length}
                lastUpdated={lastUpdated}
            />
            <main className="flex-1 overflow-y-auto p-8 relative">
                {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-30">
                        <Loader text="Procesando datos..." />
                    </div>
                )}
                <header className="-mx-8 px-8 pt-6 pb-4 mb-2 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary">Dashboard de Análisis</h1>
                        <p className="text-text-secondary">Explora los insights clave de tus datos de soporte.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                       <ToggleSwitch 
                            label={`Comparar ${comparisonYears?.current || ''} vs ${comparisonYears?.previous || ''}`}
                            enabled={compareYears}
                            onChange={setCompareYears}
                            disabled={!comparisonYears}
                        />
                    </div>
                </header>
                
                <div className="space-y-12">
                    <section id="executive-summary">
                        <ExecutiveSummary 
                            processedData={processedData?.executiveSummary} 
                            isProcessing={isProcessing}
                            compareYears={compareYears} 
                            comparisonYears={comparisonYears} 
                        />
                    </section>
                    <section id="temporal-analysis">
                        <TemporalAnalysis 
                            processedData={processedData?.temporalAnalysis}
                            isProcessing={isProcessing}
                            compareYears={compareYears}
                            comparisonYears={comparisonYears}
                        />
                    </section>
                    <section id="classification-analysis">
                        <ClassificationAnalysis 
                            processedData={processedData?.classification}
                            isProcessing={isProcessing}
                            compareYears={compareYears} 
                            comparisonYears={comparisonYears}
                        />
                    </section>
                    <section id="operational-efficiency">
                        <OperationalEfficiency
                            processedData={processedData?.operationalEfficiency}
                            isProcessing={isProcessing}
                            compareYears={compareYears}
                            comparisonYears={comparisonYears}
                        />
                    </section>
                    <section id="text-analysis-asunto">
                        <TextAnalysisAsunto 
                            processedData={processedData?.textAnalysisAsunto}
                            isProcessing={isProcessing}
                            fullDataset={filteredData}
                        />
                    </section>
                    <section id="correlation-analysis">
                        <CorrelationAnalysis 
                            processedData={processedData?.correlationAnalysis}
                            isProcessing={isProcessing}
                            fullDataset={filteredData}
                        />
                    </section>
                    <section id="general-analysis">
                        <GeneralAnalysis 
                            processedData={processedData}
                            isProcessing={isProcessing}
                        />
                    </section>
                </div>
            </main>
            <button 
                onClick={() => setIsFilterPanelOpen(true)}
                className="fixed top-6 right-8 p-3 bg-white text-text-primary rounded-full shadow-lg hover:bg-gray-100 transition-transform hover:scale-110 z-10"
                aria-label="Abrir panel de filtros"
            >
                <Filter size={20} />
            </button>
            <FilterPanel 
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                availableFilters={availableFilters}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
            />
            <button
                onClick={() => setIsAIModalOpen(true)}
                className="fixed bottom-8 right-8 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-accent transition-transform hover:scale-110"
                aria-label="Abrir Asistente IA"
            >
                <MessageSquare size={28} />
            </button>
            <AIQueryModal 
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                data={filteredData}
            />
        </div>
    );
};

export default Dashboard;