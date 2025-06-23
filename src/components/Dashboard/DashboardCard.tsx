import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'yellow' | 'red';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  badge, 
  badgeColor = 'blue' 
}) => {
  const badgeColors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-200 transition-all duration-200 text-left group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Icon className="w-5 h-5 text-green-600" />
            </div>
            {badge && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default DashboardCard;