import React from 'react';
import Card from '../ui/Card';
import ChartLoader from '../ui/ChartLoader';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import MultiLineChart from '../charts/MultiLineChart';
import AIInsight from './AIInsight';
import { Ticket } from '../../types';

interface TextAnalysisAsuntoProps {
  processedData: any;
  isProcessing: boolean;
  fullDataset: Ticket[];
}

const TextAnalysisAsunto: React.FC<TextAnalysisAsuntoProps> = ({ processedData, isProcessing, fullDataset }) => {
    const { topExpressions, expressionTrends, expressionExamples, top5ExpressionTexts } = processedData || {};

    const generatePrompt = () => {
        if (!processedData) return "";
        
        const topTopicsList = topExpressions?.slice(0, 3).map((e: any) => e.name).join(', ');
        const mainTopicTrend = expressionTrends?.[expressionTrends.length - 1]?.[top5ExpressionTexts?.[0]] > expressionTrends?.[0]?.[top5ExpressionTexts?.[0]] ? 'aumentado' : 'disminuido';

        let promptText = "Analiza los siguientes datos de texto de los asuntos de los tickets y resume en español (3-4 frases) los problemas más comunes de los usuarios.\n\n";
        promptText += `- Los temas más frecuentes (bigramas) son: "${topTopicsList}".\n`;
        if (expressionTrends?.length > 1 && top5ExpressionTexts?.length > 0) {
            promptText += `- La tendencia para el tema principal, "${top5ExpressionTexts[0]}", ha ${mainTopicTrend} en los últimos meses.\n`;
        }
        promptText += `- Se han proporcionado ejemplos de asuntos reales para cada tema.\n\n`;
        promptText += `Interpreta qué significan estos temas. ¿Indican problemas técnicos, dudas sobre procedimientos, solicitudes de servicio, etc.? ¿Qué implica la tendencia del tema principal?`;
        
        return promptText;
    };


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

export default TextAnalysisAsunto;