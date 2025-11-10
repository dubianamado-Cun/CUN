import React, { useState } from 'react';
import Card from '../ui/Card';
import LineChart from '../charts/LineChart';
import StackedBarChart from '../charts/StackedBarChart';
import Heatmap from '../charts/Heatmap';
import ChartLoader from '../ui/ChartLoader';

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
        </div>
    );
};

export default TemporalAnalysis;
