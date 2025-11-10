import React from 'react';
import Card from '../ui/Card';
import Treemap from '../charts/Treemap';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import CrosstabTable from '../charts/CrosstabTable';
import ChartLoader from '../ui/ChartLoader';

interface ClassificationAnalysisProps {
  processedData: any;
  isProcessing: boolean;
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const ClassificationAnalysis: React.FC<ClassificationAnalysisProps> = ({ processedData, isProcessing, compareYears, comparisonYears }) => {

    const { treemapData, topCategoriesData, crosstabData } = processedData || {};

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Clasificación de Solicitudes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Jerarquía de Solicitudes (Categoría → Subcategoría)" className="lg:col-span-5">
                    {isProcessing ? <ChartLoader height="h-[500px]" /> : (
                        <Treemap 
                            data={treemapData?.current} 
                            comparisonData={treemapData?.previous}
                            comparisonYears={comparisonYears}
                        />
                    )}
                </Card>
                <Card title="Top 10 Categorías" className="lg:col-span-2">
                    {isProcessing ? <ChartLoader /> : (
                        <HorizontalBarChart 
                            data={topCategoriesData}
                            compareYears={compareYears}
                            comparisonYears={comparisonYears}
                        />
                    )}
                </Card>
                <Card title={`Matriz Cruzada: Categoría vs Estado ${compareYears && comparisonYears ? `(${comparisonYears.current})` : ''}`} className="lg:col-span-3">
                   {isProcessing ? <ChartLoader /> : <CrosstabTable data={crosstabData} />}
                </Card>
            </div>
        </div>
    );
};

export default ClassificationAnalysis;
