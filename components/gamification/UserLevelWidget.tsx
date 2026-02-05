
import React from 'react';
import { UserStats } from '../../types';
import { Trophy, Star, Zap } from 'lucide-react';

interface UserLevelWidgetProps {
    stats: UserStats | null;
    variant?: 'sidebar' | 'header';
}

export const UserLevelWidget: React.FC<UserLevelWidgetProps> = ({ stats, variant = 'sidebar' }) => {
    if (!stats) return null;

    const progressPercent = Math.min((stats.currentXP / stats.maxXP) * 100, 100);

    if (variant === 'header') {
        return (
            <div className="flex items-center space-x-3 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200">
                <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Lvl {stats.level}</span>
                </div>
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500" style={{width: `${progressPercent}%`}}></div>
                </div>
                <div className="hidden md:flex items-center space-x-1 text-slate-400 text-xs font-medium">
                     <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                     <span>{stats.streakDays} dias</span>
                </div>
            </div>
        );
    }

    // Sidebar Variant (More detailed)
    return (
        <div className="px-4 py-4 mb-2">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-2 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                    <Trophy className="w-16 h-16" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Nível Atual</span>
                        <div className="flex items-center space-x-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            <span className="font-bold text-lg">{stats.level}</span>
                        </div>
                    </div>
                    
                    <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden mb-2 border border-slate-600">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out" 
                            style={{width: `${progressPercent}%`}}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{stats.currentXP} XP</span>
                        <span>{stats.maxXP} XP</span>
                    </div>

                    {stats.streakDays > 0 && (
                        <div className="mt-3 flex items-center justify-center space-x-1.5 bg-white/10 py-1 rounded-md">
                            <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                            <span className="text-xs font-bold text-yellow-100">{stats.streakDays} dias de ofensiva!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
