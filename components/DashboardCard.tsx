
import React from 'react';
import type { DashboardItem } from '../types';
import DotsVerticalIcon from './icons/DotsVerticalIcon';

const DashboardCard: React.FC<DashboardItem> = ({ icon: Icon, title, subtitle, hasMore, isSpecial }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-700/80 transition-colors duration-300 transform hover:-translate-y-1 min-h-[140px] relative overflow-hidden shadow-lg">
      <div className="absolute top-2 right-2 flex items-center space-x-2 text-slate-400">
        {isSpecial && <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full"></div>}
        {hasMore && <DotsVerticalIcon className="h-5 w-5" />}
      </div>
      <div className="flex-shrink-0 text-slate-400">
        <Icon className="h-10 w-10" />
      </div>
      <div className="mt-auto">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
};

export default DashboardCard;
