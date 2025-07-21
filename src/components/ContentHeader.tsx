import React from 'react';

interface ContentHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, className, subtitle }) => {
  return (
    <div className={`px-4 sm:px-6 lg:px-0 pt-6 max-w-screen-3xl ${className}`}>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-700 mt-1">{subtitle}</p>}
    </div>
  );
};

export default ContentHeader;