import React from 'react';
import Card from '../ui/Card';
import AIInsight from './AIInsight';
import ChartLoader from '../ui/ChartLoader';

interface GeneralAnalysisProps {
  processedData: any;
  isProcessing: boolean;
}

const GeneralAnalysis: React.FC<GeneralAnalysisProps> = ({ processedData, isProcessing }) => {

  const generateGeneralPrompt = (): string => {
    if (!processedData || isProcessing) return "";

    const { executiveSummary, temporalAnalysis, classification, operationalEfficiency, textAnalysisAsunto, correlationAnalysis } = processedData;

    // Helper to safely get data points
    const getKpi = (path: any) => path || { current: {}, previous: {} };
    const kpis = getKpi(executiveSummary?.comparisonKpis) || { current: executiveSummary?.kpis || {} };
    const opStats = getKpi(operationalEfficiency?.overallStats);
    const topCat = classification?.topCategoriesData?.[0]?.name || 'N/A';
    const topAgent = operationalEfficiency?.barChartData?.[0]?.name || 'N/A';
    const topTopic = textAnalysisAsunto?.topExpressions?.[0]?.name || 'N/A';

    let prompt = `Eres un consultor experto en análisis de datos de soporte. A continuación se presenta un resumen de un dashboard de análisis de tickets. Tu tarea es sintetizar toda la información en un "Análisis General" cohesivo en español.

El análisis debe:
1.  Comenzar con un resumen ejecutivo de 2-3 frases sobre la situación general.
2.  Identificar 3-4 hallazgos clave o "insights" de diferentes secciones.
3.  Concluir con 2-3 recomendaciones accionables y concretas.

Aquí están los datos clave:

**Resumen Ejecutivo:**
*   Total de Tickets (${kpis.current.year || ''}): ${kpis.current.totalTickets?.toLocaleString() || 'N/A'}
*   Tiempo Promedio de Resolución: ${kpis.current.avgResolutionHours?.toFixed(1) || 'N/A'} hs
*   Tasa de Cumplimiento de SLA: ${opStats.current.slaRate?.toFixed(1) || 'N/A'}%

**Tendencias y Clasificación:**
*   El volumen de tickets muestra una tendencia [describir brevemente, ej: al alza/a la baja/estable].
*   La categoría con más tickets es "${topCat}".
*   Los temas más comunes en los asuntos son sobre "${topTopic}".

**Eficiencia y Patrones:**
*   El agente con más tickets gestionados es "${topAgent}".
*   Existe una correlación entre el número de reasignaciones y el tiempo de resolución.
*   Los tickets con sentimiento negativo tardan en promedio ${correlationAnalysis?.sentimentTimeData?.negative.toFixed(1)} hs en resolverse.

Por favor, genera el análisis basado estrictamente en esta información.`;

    return prompt;
  };

  return (
    <div>
        <h2 className="text-3xl font-bold text-text-primary mb-6">Análisis General</h2>
        <Card>
            {isProcessing ? (
                <ChartLoader height="h-64" />
            ) : (
                <AIInsight 
                    prompt={generateGeneralPrompt()}
                    title="Análisis General del Informe"
                />
            )}
        </Card>
    </div>
  );
};

export default GeneralAnalysis;