import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, ...rest }) => {
  return (
    <div className={`bg-card rounded-xl shadow-md p-6 ${className}`} {...rest}>
      {title && <h3 className="text-xl font-bold text-text-primary mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;