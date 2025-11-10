import React from 'react';
import PlaceholderSection from './PlaceholderSection';
import { GitMerge } from 'lucide-react';

const CorrelationAnalysis: React.FC = () => {
  return (
    <PlaceholderSection 
      title="Correlaciones y Patrones"
      description="Esta sección explorará las relaciones entre diferentes métricas del dataset. Se utilizarán heatmaps de correlación y boxplots para visualizar cómo variables como la categoría, sede o sentimiento impactan en los tiempos de resolución."
      icon={GitMerge}
    />
  );
};

export default CorrelationAnalysis;