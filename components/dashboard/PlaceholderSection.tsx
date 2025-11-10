import React from 'react';
import Card from '../ui/Card';

interface PlaceholderSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ title, description, icon: Icon }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-text-primary mb-6">{title}</h2>
      <Card>
        <div className="flex flex-col items-center text-center justify-center h-64">
            <Icon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-text-primary">Próximamente</h3>
            <p className="mt-2 max-w-md text-text-secondary">{description}</p>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderSection;