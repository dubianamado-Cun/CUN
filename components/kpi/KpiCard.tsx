
import React from 'react';
import Card from '../ui/Card';

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, change }) => {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-secondary uppercase">{title}</h4>
        <div className="bg-gray-100 p-2 rounded-lg">
            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold text-text-primary">{value}</p>
        {change && <p className="text-sm text-text-secondary mt-1">{change}</p>}
      </div>
    </Card>
  );
};

export default KpiCard;
   