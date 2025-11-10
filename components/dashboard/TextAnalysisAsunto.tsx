import React from 'react';
import Card from '../ui/Card';
import ChartLoader from '../ui/ChartLoader';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import MultiLineChart from '../charts/MultiLineChart';

interface TextAnalysisAsuntoProps {
  processedData: any;
  isProcessing: boolean;
}

const TextAnalysisAsunto: React.FC<TextAnalysisAsuntoProps> = ({ processedData, isProcessing }) => {
    const { topExpressions, expressionTrends, expressionExamples, top5ExpressionTexts } = processedData || {};

    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">Análisis de Texto – Asunto</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Tendencia Mensual de Expresiones Clave" className="lg:col-span-2">
                    {isProcessing ? <ChartLoader /> : (
                        <MultiLineChart
                            data={expressionTrends || []}
                            lines={top5ExpressionTexts || []}
                        />
                    )}
                </Card>

                <Card title="Expresiones Más Frecuentes (Bigramas)">
                     {isProcessing ? <ChartLoader /> : (
                        <HorizontalBarChart 
                            data={topExpressions || []}
                            compareYears={false}
                            comparisonYears={null}
                        />
                     )}
                </Card>

                <Card title="Ejemplos por Expresión Identificada">
                     {isProcessing ? <ChartLoader /> : (
                        <div className="max-h-96 overflow-y-auto space-y-4">
                           {(expressionExamples || []).map((topic: any) => (
                               <div key={topic.name} className="p-3 bg-gray-50 rounded-lg">
                                   <h4 className="font-bold text-md text-text-primary mb-2 capitalize">{topic.name} ({topic.count.toLocaleString()} tickets)</h4>
                                   <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                                       {topic.examples.map((example: string, index: number) => (
                                           <li key={index} className="truncate" title={example}>{example}</li>
                                       ))}
                                   </ul>
                               </div>
                           ))}
                        </div>
                     )}
                </Card>
            </div>
        </div>
    );
};

export default TextAnalysisAsunto;