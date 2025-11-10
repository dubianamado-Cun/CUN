import React from 'react';
import Card from '../ui/Card';
import Treemap from '../charts/Treemap';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import CrosstabTable from '../charts/CrosstabTable';
import ChartLoader from '../ui/ChartLoader';
import AIInsight from './AIInsight';

interface ClassificationAnalysisProps {
  processedData: any;
  isProcessing: boolean;
  compareYears: boolean;
  comparisonYears: { current: number; previous: number } | null;
}

const ClassificationAnalysis: React.FC<ClassificationAnalysisProps> = ({ processedData, isProcessing, compareYears, comparisonYears }) => {

    const { treemapData, topCategoriesData, crosstabData } = processedData || {};

    const generatePrompt = () => {
        if (!processedData) return "";

        const topCategoriesList = topCategoriesData?.slice(0, 3).map((c: any) => c.name).join(', ');
        const mainCategory = treemapData?.current?.children?.[0];
        const mainSubcategories = mainCategory?.children?.slice(0, 2).map((sc: any) => sc.name).join(' y ');
        
        let promptText = "Analiza los siguientes datos de clasificación de tickets y sintetiza los puntos en un análisis en español (3-4 frases) que identifique los tipos de solicitudes más impactantes.\n\n";
        promptText += `- Las principales categorías por volumen de tickets son: ${topCategoriesList}.\n`;
        if (mainCategory && mainSubcategories) {
            promptText += `- La categoría más grande, "${mainCategory.name}", se concentra principalmente en las subcategorías: ${mainSubcategories}.\n`;
        }
        promptText += "- La matriz de estado muestra la distribución de tickets por categoría y su estado actual.\n\n";
        promptText += `Busca patrones interesantes, como una categoría con un número desproporcionado de tickets en un estado específico (ej. "Pendiente" o "En Progreso") y menciona qué podría significar.`;

        return promptText;
    };

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

export default ClassificationAnalysis;