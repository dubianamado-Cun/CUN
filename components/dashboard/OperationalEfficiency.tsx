import React from 'react';
import KpiCard from '../kpi/KpiCard';
import { ShieldCheck, ShieldOff, Clock } from 'lucide-react';
import Card from '../ui/Card';
import ScatterPlot from '../charts/ScatterPlot';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import ChartLoader from '../ui/ChartLoader';

interface OperationalEfficiencyProps {
  processedData: any;
  isProcessing: boolean;
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const OperationalEfficiency: React.FC<OperationalEfficiencyProps> = ({ processedData, isProcessing, compareYears, comparisonYears }) => {
    
    const { overallStats, agentPerformanceData, barChartData, scatterPlotData } = processedData || {};

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Eficiencia Operativa</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {isProcessing ? Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-36 animate-pulse bg-gray-200" />) : (
                    <>
                        <KpiCard
                            title="Cumplimiento SLA Global"
                            value={`${overallStats?.current.slaRate.toFixed(1)}%`}
                            icon={<ShieldCheck className="text-primary" />}
                            change={overallStats?.previous ? `${((overallStats.current.slaRate - overallStats.previous.slaRate)).toFixed(1)} pts` : undefined}
                        />
                        <KpiCard
                            title="Total Tickets Vencidos"
                            value={overallStats?.current.slaMissed.toLocaleString()}
                            icon={<ShieldOff className="text-red-500" />}
                            change={overallStats?.previous ? `${(overallStats.current.slaMissed - overallStats.previous.slaMissed).toLocaleString()} vs ${overallStats.previous.slaMissed.toLocaleString()}` : undefined}
                        />
                         <KpiCard
                            title="Tiempo Prom. Resolución (Global)"
                            value={`${overallStats?.current.avgResolution.toFixed(1)} hs`}
                            icon={<Clock className="text-purple-500" />}
                            change={overallStats?.previous ? `${(overallStats.current.avgResolution - overallStats.previous.avgResolution).toFixed(1)} hs` : undefined}
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Top 15 Agentes por Volumen de Tickets">
                     {isProcessing ? <ChartLoader /> : (
                        <HorizontalBarChart
                            data={barChartData}
                            compareYears={compareYears}
                            comparisonYears={comparisonYears}
                        />
                    )}
                </Card>
                <Card title={`Eficiencia de Agentes ${compareYears && comparisonYears ? `(${comparisonYears.current})` : ''}`}>
                    <div className="h-96">
                        {isProcessing ? <ChartLoader /> : (
                            <ScatterPlot 
                                data={scatterPlotData}
                                xAxisLabel="Volumen de Tickets Gestionados"
                                yAxisLabel="Tiempo Promedio de Resolución (Horas)"
                            />
                        )}
                    </div>
                </Card>
                <Card title={`Tabla de Cumplimiento de SLA por Agente ${compareYears && comparisonYears ? `(${comparisonYears.current} vs ${comparisonYears.previous})` : ''}`} className="lg:col-span-2">
                    {isProcessing ? <ChartLoader /> : (
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="sticky top-0 bg-gray-50">
                                    <tr>
                                        <th className="p-2 font-semibold">Agente</th>
                                        <th className="p-2 font-semibold text-center">SLA Cumplidos</th>
                                        <th className="p-2 font-semibold text-center">Tickets Vencidos</th>
                                        <th className="p-2 font-semibold text-center">Tasa Cumplimiento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(agentPerformanceData as any[] || []).map((agent, index) => {
                                        const current = compareYears ? agent.current : agent;
                                        const previous = compareYears ? agent.previous : null;
                                        if (!current) return null;
                                        return (
                                            <tr key={agent.agentName || index} className="border-t">
                                                <td className="p-2 font-medium truncate max-w-xs">{agent.agentName}</td>
                                                <td className="p-2 text-center">{current.slaMet.toLocaleString()} {previous && <span className="text-xs text-gray-500">({(current.slaMet - (previous.slaMet || 0)).toLocaleString('es-ES', {signDisplay: 'always'})})</span>}</td>
                                                <td className="p-2 text-center">{current.slaMissed.toLocaleString()} {previous && <span className="text-xs text-gray-500">({(current.slaMissed - (previous.slaMissed || 0)).toLocaleString('es-ES', {signDisplay: 'always'})})</span>}</td>
                                                <td className="p-2 text-center font-bold">{current.slaRate.toFixed(1)}% {previous && <span className="text-xs text-gray-500">({(current.slaRate - (previous.slaRate || 0)).toFixed(1)} pts)</span>}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default OperationalEfficiency;
