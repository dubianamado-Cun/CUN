import React, { useState } from 'react';
import Card from '../ui/Card';
import LineChart from '../charts/LineChart';
import StackedBarChart from '../charts/StackedBarChart';
import Heatmap from '../charts/Heatmap';
import ChartLoader from '../ui/ChartLoader';
import AIInsight from './AIInsight';

interface TemporalAnalysisProps {
  processedData: any;
  isProcessing: boolean;
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

type TimeSeriesPeriod = 'daily' | 'weekly' | 'monthly';

const TemporalAnalysis: React.FC<TemporalAnalysisProps> = ({ processedData, isProcessing, compareYears, comparisonYears }) => {
    // Note: Period selection is now disabled in favor of pre-calculation.
    // This could be re-enabled by passing the period to the central processing function.
    const [timeSeriesPeriod] = useState<TimeSeriesPeriod>('monthly');
    const [stackedBarPeriod] = useState<TimeSeriesPeriod>('monthly');
    
    const { timeSeriesData, stackedBarData, heatmapData, statusOrder, statusColors } = processedData || {};

    const lineChartTitle = compareYears 
        ? 'Comparación Anual: Creados vs. Resueltos'
        : `Tickets Creados vs. Resueltos por ${ { monthly: 'Mes', weekly: 'Semana', daily: 'Día' }[timeSeriesPeriod] }`;
    
    const stackedBarChartTitle = compareYears
        ? 'Comparación Anual: Volumen de Tickets por Mes'
        : `Tickets por Estado por ${ { monthly: 'Mes', weekly: 'Semana', daily: 'Día' }[stackedBarPeriod] }`;

    const generatePrompt = () => {
        if (!processedData) return "";

        const peakDayHour = () => {
            const grid = heatmapData?.current;
            if (!grid) return "No disponible";
            let maxVal = -1;
            let day = -1;
            let hour = -1;
            grid.forEach((row: number[], dayIndex: number) => {
                row.forEach((val: number, hourIndex: number) => {
                    if (val > maxVal) {
                        maxVal = val;
                        day = dayIndex;
                        hour = hourIndex;
                    }
                });
            });
            const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            return `${dayNames[day]} a las ${hour}:00`;
        };
        
        let promptText = "Analiza las siguientes tendencias temporales de tickets de soporte y proporciona una conclusión en español (3-4 frases) sobre la gestión de la carga de trabajo.\n\n";
        promptText += `- Los volúmenes mensuales de tickets creados vs. resueltos muestran una tendencia. ${compareYears ? `Compara el año ${comparisonYears?.current} con el ${comparisonYears?.previous}.` : ''}\n`;
        promptText += `- Los picos de carga de creación de tickets ocurren principalmente sobre esta hora y día: ${peakDayHour()}.\n`;
        promptText += "Comenta sobre la estacionalidad, los patrones diarios/semanales y si la capacidad de resolución parece ajustarse a la demanda de creación.";

        return promptText;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Análisis Temporal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-primary">{lineChartTitle}</h3>
                    </div>
                    {isProcessing ? <ChartLoader /> : (
                        <LineChart 
                            data={timeSeriesData} 
                            compareYears={compareYears}
                            comparisonYears={comparisonYears}
                        />
                    )}
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-primary">{stackedBarChartTitle}</h3>
                    </div>
                    {isProcessing ? <ChartLoader /> : (
                        <StackedBarChart 
                            data={stackedBarData} 
                            statusOrder={statusOrder} 
                            statusColors={statusColors} 
                            compareYears={compareYears}
                            comparisonYears={comparisonYears}
                        />
                    )}
                </Card>
                <Card title="Picos de Carga por Día y Hora" className="lg:col-span-2">
                    {isProcessing ? <ChartLoader /> : (
                        <Heatmap 
                            data={heatmapData?.current} 
                            comparisonData={heatmapData?.previous}
                            comparisonYears={comparisonYears}
                        />
                    )}
                </Card>
            </div>
            {!isProcessing && (
                <Card className="mt-6">
                    <AIInsight
                        prompt={generatePrompt()}
                        title="Análisis"
                    />
                </Card>
            )}
        </div>
    );
};

export default TemporalAnalysis;