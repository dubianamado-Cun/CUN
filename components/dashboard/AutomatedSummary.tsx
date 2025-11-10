import React from 'react';
import PlaceholderSection from './PlaceholderSection';
import { BrainCircuit } from 'lucide-react';

const AutomatedSummary: React.FC = () => {
  return (
    <PlaceholderSection 
      title="Conclusiones Automáticas"
      description="Un resumen interpretativo generado automáticamente que destacará los hallazgos más importantes del análisis, proporcionando conclusiones clave y recomendaciones basadas en los datos procesados en todo el dashboard."
      icon={BrainCircuit}
    />
  );
};

export default AutomatedSummary;