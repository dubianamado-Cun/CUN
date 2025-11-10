import React, { useState, useEffect } from 'react';
import { generateInsights } from '../../services/geminiService';
import Loader from '../ui/Loader';
import { Sparkles } from 'lucide-react';

interface AIInsightProps {
  prompt: string;
  title: string;
}

const AIInsight: React.FC<AIInsightProps> = ({ prompt, title }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInsight = async () => {
      if (!prompt) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateInsights(prompt);
        // Simple markdown formatting 
        const formattedResult = result
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');
        setInsight(formattedResult);
      } catch (err) {
        setError('No se pudo generar el análisis.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getInsight();
  }, [prompt]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
            <Loader text="Generando análisis..." />
        </div>
      );
    }
    if (error) {
      return <p className="text-sm text-red-500">{error}</p>;
    }
    return (
        <div className="text-sm text-text-secondary prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: insight }} />
    );
  };

  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-semibold text-text-primary mb-2 flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-primary" />
        {title}
      </h4>
      {renderContent()}
    </div>
  );
};

export default AIInsight;
