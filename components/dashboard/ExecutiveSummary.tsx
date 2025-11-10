import React from 'react';
import KpiCard from '../kpi/KpiCard';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    Zap, 
    GitBranch, 
    Smile 
} from 'lucide-react';
import Card from '../ui/Card';
import ChartLoader from '../ui/ChartLoader';

interface ExecutiveSummaryProps {
  processedData: any; // Data is now pre-processed
  isProcessing: boolean;
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ processedData, isProcessing, compareYears, comparisonYears }) => {
    
    const getComparisonChange = (current: number, previous: number) => {
        if (previous === 0) {
            return current > 0 ? 'Aumento (vs 0)' : '';
        }
        const change = ((current - previous) / previous) * 100;
        if (Math.abs(change) < 0.1) return `vs ${previous.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
        
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}% vs ${previous.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
    };
    
    const kpiData = processedData?.kpis;
    const comparisonKpis = processedData?.comparisonKpis;

    const kpis = [
        {
            title: "Total de Tickets",
            value: (comparisonKpis ? comparisonKpis.current.totalTickets : kpiData?.totalTickets)?.toLocaleString() || '0',
            change: comparisonKpis ? getComparisonChange(comparisonKpis.current.totalTickets, comparisonKpis.previous.totalTickets) : undefined,
            icon: <FileText className="text-primary" />,
        },
        {
            title: "% Tickets Cerrados",
            value: `${(comparisonKpis ? comparisonKpis.current.percentageClosed : kpiData?.percentageClosed)?.toFixed(1) || '0.0'}%`,
            change: comparisonKpis ? getComparisonChange(comparisonKpis.current.percentageClosed, comparisonKpis.previous.percentageClosed) : undefined,
            icon: <CheckCircle className="text-green-500" />,
        },
        {
            title: "Tiempo Prom. Resolución",
            value: (comparisonKpis ? comparisonKpis.current.avgResolutionHours : kpiData?.avgResolutionHours) > 0 
                ? `${(comparisonKpis ? comparisonKpis.current.avgResolutionHours : kpiData?.avgResolutionHours)?.toFixed(1) || '0.0'} hs` 
                : 'N/A',
            change: comparisonKpis ? getComparisonChange(comparisonKpis.current.avgResolutionHours, comparisonKpis.previous.avgResolutionHours) : undefined,
            icon: <Clock className="text-purple-500" />,
        },
        {
            title: "Tasa Res. 1er Contacto",
            value: `${(comparisonKpis ? comparisonKpis.current.fcrRate : kpiData?.fcrRate)?.toFixed(1) || '0.0'}%`,
            change: comparisonKpis ? getComparisonChange(comparisonKpis.current.fcrRate, comparisonKpis.previous.fcrRate) : undefined,
            icon: <Zap className="text-yellow-500" />,
        },
        {
            title: "Reasignaciones Prom.",
            value: (comparisonKpis ? comparisonKpis.current.avgReassignments : kpiData?.avgReassignments)?.toFixed(2) || '0.00',
            change: comparisonKpis ? getComparisonChange(comparisonKpis.current.avgReassignments, comparisonKpis.previous.avgReassignments) : undefined,
            icon: <GitBranch className="text-orange-500" />,
        },
        {
            title: "Sentimiento Positivo",
            value: `${(comparisonKpis ? comparisonKpis.current.positiveSentimentRate : kpiData?.positiveSentimentRate)?.toFixed(1) || '0.0'}%`,
            change: comparisonKpis ? getComparisonChange(comparisonKpis.current.positiveSentimentRate, comparisonKpis.previous.positiveSentimentRate) : undefined,
            icon: <Smile className="text-pink-500" />,
        },
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Resumen Ejecutivo</h2>
            {compareYears && comparisonYears && <p className="text-sm text-text-secondary mb-4">Mostrando comparación entre {comparisonYears.current} (actual) y {comparisonYears.previous} (anterior).</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {isProcessing ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="flex flex-col justify-between h-40">
                           <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                           <div className="w-1/2 h-8 bg-gray-200 rounded animate-pulse mt-4"></div>
                           <div className="w-full h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
                        </Card>
                    ))
                ) : (
                    kpis.map((kpi) => (
                        <KpiCard
                            key={kpi.title}
                            title={kpi.title}
                            value={kpi.value}
                            icon={kpi.icon}
                            change={kpi.change}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ExecutiveSummary;
