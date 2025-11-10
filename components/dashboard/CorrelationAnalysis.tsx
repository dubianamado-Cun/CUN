import React from 'react';
import Card from '../ui/Card';
import ScatterPlot from '../charts/ScatterPlot';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import AIInsight from './AIInsight';
import ChartLoader from '../ui/ChartLoader';
import { Ticket } from '../../types';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';

interface CorrelationAnalysisProps {
    processedData: any;
    isProcessing: boolean;
    fullDataset: Ticket[];
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ processedData, isProcessing, fullDataset }) => {
    const { scatterPlotData, topCategoriesByTimeData, sentimentTimeData, outlierTicketsData } = processedData || {};

    const generateCombinedPrompt = (): string => {
        if (!processedData) return "";

        const topSlowCategories = topCategoriesByTimeData?.slice(0, 3).map((d: any) => d.name).join(', ');
        const sentimentComparison = sentimentTimeData?.negative > sentimentTimeData?.positive ? 'más' : 'menos';
        const outlierCount = outlierTicketsData?.length || 0;

        let promptText = "Sintetiza los siguientes hallazgos de correlación y patrones en un análisis en español (3-4 frases) sobre la eficiencia del proceso de soporte.\n\n";
        promptText += `- Se observa una correlación entre el número de reasignaciones y el tiempo de resolución.\n`;
        promptText += `- Las categorías que más tardan en resolverse son: ${topSlowCategories}.\n`;
        promptText += `- Los tickets con sentimiento negativo tardan en promedio ${sentimentComparison} tiempo en resolverse que los positivos.\n`;
        promptText += `- Se han identificado ${outlierCount} tickets atípicos con métricas muy elevadas.\n\n`;
        promptText += `Conecta estos puntos: ¿qué problema general sugieren? (p. ej., problemas de enrutamiento, complejidad en ciertas categorías, impacto de la frustración del cliente, etc.).`;

        return promptText;
    }

    const sentimentKpis = [
        { label: 'Positivo', value: sentimentTimeData?.positive, icon: <TrendingUp className="text-green-500" /> },
        { label: 'Neutro', value: sentimentTimeData?.neutral, icon: <Minus className="text-gray-500" /> },
        { label: 'Negativo', value: sentimentTimeData?.negative, icon: <TrendingDown className="text-red-500" /> }
    ];

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Correlaciones y Patrones</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <Card title="Correlación: Tiempo de Resolución vs. Reasignaciones">
                    <div className="h-80">
                        {isProcessing ? <ChartLoader /> : (
                            <ScatterPlot
                                data={scatterPlotData || []}
                                xAxisLabel="Número de Reasignaciones"
                                yAxisLabel="Tiempo de Resolución (Horas)"
                            />
                        )}
                    </div>
                </Card>

                <Card title="Top 10 Categorías por Tiempo de Resolución">
                    <div className="h-80 overflow-y-auto">
                        {isProcessing ? <ChartLoader /> : (
                            <HorizontalBarChart
                                data={topCategoriesByTimeData || []}
                                compareYears={false}
                                comparisonYears={null}
                            />
                        )}
                    </div>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Impacto del Sentimiento en la Resolución">
                        {isProcessing ? <ChartLoader /> : (
                            <div className="space-y-4">
                                {sentimentKpis.map(kpi => (
                                    <div key={kpi.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            {kpi.icon}
                                            <span className="ml-3 font-semibold text-text-primary">{kpi.label}</span>
                                        </div>
                                        <span className="text-lg font-bold text-text-primary">
                                            {typeof kpi.value === 'number' ? `${kpi.value.toFixed(1)} hs` : 'N/A'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Tickets Atípicos (Outliers)">
                        {isProcessing ? <ChartLoader /> : (
                            <div className="max-h-48 overflow-y-auto">
                                <ul className="space-y-2">
                                    {(outlierTicketsData && outlierTicketsData.length > 0) ? outlierTicketsData.map((ticket: any) => (
                                        <li key={ticket.id} className="p-2 border rounded-md hover:bg-gray-50">
                                            <p className="font-semibold text-sm text-text-primary truncate" title={ticket.asunto}>{ticket.asunto || `Ticket ID: ${ticket.id}`}</p>
                                            <div className="flex justify-between text-xs text-text-secondary mt-1">
                                                <span><strong className="text-red-500">{ticket.resolutionTimeHours.toFixed(1)} hs</strong> de resolución</span>
                                                <span><strong className="text-orange-500">{ticket.reassignments}</strong> reasignaciones</span>
                                            </div>
                                        </li>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary p-4">
                                            <Lightbulb className="w-10 h-10 text-gray-300 mb-2" />
                                            <p className="font-semibold">¡Buenas noticias!</p>
                                            <p>No se encontraron tickets con valores atípicos significativos.</p>
                                        </div>
                                    )}
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
             {!isProcessing && (
                <Card className="mt-6">
                    <AIInsight
                        prompt={generateCombinedPrompt()}
                        title="Análisis"
                    />
                </Card>
            )}
        </div>
    );
};

export default CorrelationAnalysis;